import { Config } from './config/config';
import * as amqp from 'amqplib/callback_api';
import { ConfigService } from '@nestjs/config';
import { Injectable, OnModuleInit, Scope } from '@nestjs/common';
import { OpensearchService } from './opensearch/opensearch.service';
import {
  AmqpConnectionManager,
  Channel,
  ChannelWrapper,
  connect,
} from 'amqp-connection-manager';
import axios from 'axios';
import { formatISO } from 'date-fns';
import { ToggleMessageDto } from './opensearch/opensearch.dto';
import { IsNull, Not, Repository } from 'typeorm';
import { TenantEntity } from 'libs/entities/tenant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SingleIngestService } from './opensearch/singleIngest.service';
import { CoordinateDto } from './base-metric.dto';
@Injectable({
  scope: Scope.REQUEST
})
export class BaseMetricService implements OnModuleInit {
  private connection: AmqpConnectionManager;
  private channelWrapper: ChannelWrapper;
  private isSendingMessages: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private isVehicleRouteSent = false;
  private currentDriveMetricIndex = 0;
  private lastMessageSentTime: number = 0;
  private cachedCoordinates: any;
  private channel;
  private isGeneratingMetrics = false;

  constructor(
    @InjectRepository(TenantEntity)
    private TenantEntity: Repository<TenantEntity>,
    private readonly opensearchService: OpensearchService,
    private readonly singleIngestService: SingleIngestService,
    private readonly configService: ConfigService,
  ) {
  }

  async onModuleInit() {
    console.log('Initializing RabbitMQ connection...');
  
    // Establish connection
    this.connection = connect(
      [`amqp://${this.configService.get<string>('RABBITMQ_USER')}:${this.configService.get<string>('RABBITMQ_PASS')}@${this.configService.get<string>('RABBITMQ_HOST')}`]
    );
  
    // Create simple channel for other operations
    this.channel = await this.connection.createChannel();
  
    // Get tenants with defined schemas
    const tenants = await this.TenantEntity.createQueryBuilder('tenant')
      .where({ schema: Not(IsNull()) })
      .getMany();
    const schemaNames = tenants.map((a) => a.schema);
  
    for (const schemaName of schemaNames) {
      const exchangeName = `${schemaName.toLowerCase()}.exchange`;
  
      this.channelWrapper = this.connection.createChannel({
        json: true,
        setup: (channel: Channel, callback: (err?: Error) => void) => {
          const setupAsync = async () => {
            try {
              await channel.assertExchange(exchangeName, 'direct', { durable: true });
  
              let exchange = null;
              do {
                const response = await axios.get(
                  `http://${this.configService.get<string>('RABBITMQ_HOST_API')}/api/exchanges`,
                  {
                    auth: {
                      username: this.configService.get<string>('RABBITMQ_USER'),
                      password: this.configService.get<string>('RABBITMQ_PASS'),
                    },
                  }
                );
                exchange = (response.data as any[]).find(e => e.name === exchangeName);
              } while (!exchange);
  
              for (const queue of Config.rabbitmq.queues) {
                const nameQueue = `${schemaName.toLowerCase()}.${queue}.que`;
                const indexOpenSearch = `${schemaName.toLowerCase()}.${queue}`;
                const routeKey = `${queue}.key`;
  
                await channel.assertQueue(nameQueue, { durable: true });
  
                let checkQueue = null;
                do {
                  const response = await axios.get(
                    `http://${this.configService.get<string>('RABBITMQ_HOST_API')}/api/queues`,
                    {
                      auth: {
                        username: this.configService.get<string>('RABBITMQ_USER'),
                        password: this.configService.get<string>('RABBITMQ_PASS'),
                      },
                    }
                  );
                  checkQueue = (response.data as any[]).find(q => q.name === nameQueue);
                } while (!checkQueue);
  
                await channel.bindQueue(nameQueue, exchangeName, routeKey);
  
                channel.consume(nameQueue, (msg) => {
                  if (msg) {
                    const content = msg.content.toString();
                    const newData = this.isJsonString(content)
                      ? {
                          customer_id: exchangeName,
                          topic: routeKey,
                          data: JSON.parse(content),
                        }
                      : {
                          customer_id: exchangeName,
                          topic: routeKey,
                          content,
                        };

                    this.processMessage(indexOpenSearch, newData);
                    channel.ack(msg);
                  }
                });
              }
  
              callback(); // success
            } catch (err) {
              callback(err as Error); // error
            }
          };
  
          setupAsync(); // start async setup
        },
      });
    }
  }

  isJsonString(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }

  async getQueues(): Promise<string[]> {
    try {
      const response = await axios.get(
        `http://${this.configService.get<string>('RABBITMQ_HOST_API')}/api/queues`,
        {
          auth: {
            username: this.configService.get<string>('RABBITMQ_USER'),
            password: this.configService.get<string>('RABBITMQ_PASS'),
          },
        },
      );

      // Lọc ra những queue có type là 'classic' hoặc 'quorum' (tùy vào loại queue bạn muốn)
      return response.data
        .filter((queue) => queue.type === 'classic' || queue.type === 'quorum') // Điều kiện lọc
        .map((queue) => queue.name);
    } catch (error) {
      console.error('Error fetching queues:', error);
      throw new Error('Unable to fetch queues from RabbitMQ');
    }
  }

  private async processMessage(queue: string, data: any, schema?: string) {
    try {
      // Giả sử rằng indexName sẽ là tên của hàng đợi, nếu không bạn có thể thay đổi logic này
      const indexName = queue.toLocaleLowerCase();

      // Kiểm tra và gửi dữ liệu đến OpenSearch
      if (indexName) {
        if (Array.isArray(data)) {
          await this.opensearchService.bulkDataIngestion({
            indexName: indexName,
            data: data,
          });
        } else {
          await this.singleIngestService.singleDataIngestion({
            indexName,
            data,
            schema,
          });
        }
      }
    } catch (error) {
      console.error(`Error indexing data from ${queue}`, error);
    }
  }

  private async processMessage2(queue: string, data: any, schema?: string) {
    try {
      // Giả sử rằng indexName sẽ là tên của hàng đợi, nếu không bạn có thể thay đổi logic này
      const indexName = queue.toLocaleLowerCase();
      // Kiểm tra và gửi dữ liệu đến OpenSearch
      if (indexName) {
        if (Array.isArray(data)) {
          await this.opensearchService.bulkDataIngestion({
            indexName: indexName,
            data: data,
          });
        } else {
          if (indexName.includes('drive_metrics')) {
            await this.opensearchService.singleDataIngestion1({
              indexName,
              data,
              schema,
            });
          } else {
            await this.opensearchService.singleDataIngestion1({
              indexName,
              data,
              schema,
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error indexing data from ${queue}`, error);
    }
  }

  getRandomCoordinates(
    center: { x: number; y: number },
    minRadiusKm: number,
    maxRadiusKm: number,
  ) {
    const radius = Math.random() * (maxRadiusKm - minRadiusKm) + minRadiusKm;
    const angle = Math.random() * 2 * Math.PI;

    const dx = (radius * Math.cos(angle)) / 50; // 111 km là xấp xỉ khoảng cách của 1 độ kinh độ và vĩ độ
    const dy = (radius * Math.sin(angle)) / 50;

    return {
      x: center.x + dx,
      y: center.y + dy,
    };
  }

  async getCoordinates() {
    if (this.cachedCoordinates) {
      return this.cachedCoordinates;
    }

    const center = { x: 126.7974, y: 35.1396 };
    const start = this.getRandomCoordinates(center, 1, 2);
    const goal = this.getRandomCoordinates(center, 1, 2);
    const url = `https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving?start=${start.x},${start.y}&goal=${goal.x},${goal.y}&option=trafast`;

    const headers = {
      'X-NCP-APIGW-API-KEY-ID': this.configService.get<string>(
        'X_NCP_APIGW_API_KEY_ID',
      ),
      'X-NCP-APIGW-API-KEY': this.configService.get<string>(
        'X_NCP_APIGW_API_KEY',
      ),
    };

    try {
      const response = await axios.get(url, { headers });
      const path = response.data.route.trafast[0].path;
      const result = response.data.route.trafast[0];

      this.cachedCoordinates = {
        result,
        coordinates: path.map((coord: number[]) => ({
          x: coord[0],
          y: coord[1],
        })),
      };

      return this.cachedCoordinates;
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      return { coordinates: [], distance: 0, duration: 0 };
    }
  }

  async getCoordinatesAPI(coordinateDto: CoordinateDto) {
    const url = `https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving?start=${+coordinateDto.startX},${+coordinateDto.goalX}&goal=${+coordinateDto.startY},${+coordinateDto.goalY}&option=trafast`;

    const headers = {
      'X-NCP-APIGW-API-KEY-ID': this.configService.get<string>(
        'X_NCP_APIGW_API_KEY_ID',
      ),
      'X-NCP-APIGW-API-KEY': this.configService.get<string>(
        'X_NCP_APIGW_API_KEY',
      ),
    };

    try {
      const response = await axios.get(url, { headers });

      return response.data;
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      return { coordinates: [], distance: 0, duration: 0 };
    }
  }

  private async assertAndSendToQueue(
    channel: any,
    queue: string,
    message: any,
  ) {
    return new Promise((resolve) => {
      channel.assertQueue(queue, { durable: true });
      channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
        persistent: true,
      });
      console.log('Message sent to queue:', queue);
      resolve(true);
    });
  }

  millisecondsToMinutes(milliseconds: number): number {
    const minutes = milliseconds / 60000; // 1 minute = 60,000 milliseconds
    return parseFloat(minutes.toFixed(1));
  }

  metersToKilometers(meters: number): number {
    const kilometers = meters / 1000; // 1 kilometer = 1000 meters
    return kilometers; // Reducing to one decimal place
  }

  async sendMessage2(data: any) {
    amqp.connect(
      `amqp://${this.configService.get<string>('RABBITMQ_USER')}:${this.configService.get<string>('RABBITMQ_PASS')}@${this.configService.get<string>('RABBITMQ_HOST')}`,
      (err, connection) => {
        if (err) throw err;
        connection.createChannel(async (err, channel) => {
          if (err) throw err;
          try {
            this.assertAndSendToQueue(channel, 'sample_queue', data);
            this.isVehicleRouteSent = true; // Mark as sent
            // this.lastMessageSentTime = currentTime; // Update the last message sent time
          } catch (error) {
            console.error('Error sending messages:', error);
          }
        });
      },
    );
  }

  getRandomNumber() {
    return Math.floor(Math.random() * 9); // Tạo số nguyên từ 0 đến 8
  }

  async generateVehicleRouteAndDriveMetrics(
    toggleMessageDto: ToggleMessageDto,
  ): Promise<{
    route_info: any;
    drive_metrics: any[];
  }> {
    const center = { x: 126.7974, y: 35.1396 };
    const start = this.getRandomCoordinates(center, 1, 2);
    const goal = this.getRandomCoordinates(center, 1, 2);
    const url = `https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving?start=${start.x},${start.y}&goal=${goal.x},${goal.y}&option=trafast`;

    const headers = {
      'X-NCP-APIGW-API-KEY-ID': this.configService.get<string>(
        'X_NCP_APIGW_API_KEY_ID',
      ),
      'X-NCP-APIGW-API-KEY': this.configService.get<string>(
        'X_NCP_APIGW_API_KEY', 
      ),
    };

    try {
      const response = await axios.get(url, { headers });
      const path = response.data.route.trafast[0].path;
      const result = response.data.route.trafast[0];

      const route_info = {
        customer_id: toggleMessageDto.customerId,
        topic: 'route_info',
        data: result,
      };

      const newCoordinates = path.map((coord: number[]) => ({
        x: coord[0],
        y: coord[1],
      }));

      const drive_metrics = newCoordinates.map((coord) => {
        return {
          customer_id: toggleMessageDto.customerId,
          topic: 'drive_metrics',
          data: {
            timestamp: toggleMessageDto.timestamp || new Date().toISOString(),
            route_id: toggleMessageDto.routeId,
            drive_mode: this.getRandomNumber(),
            section_id: toggleMessageDto.sectionId,
            section_name: null,
            segment_id: toggleMessageDto.segmentId,
            location: [coord.x, coord.y],
            angle: 220,
            eco_score: 10,
            distance: 1,
            speeding: 50,
            sudden_accel: 0,
            sudden_break: 0,
          },
        };
      });

      return { route_info, drive_metrics };
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      return { route_info: null, drive_metrics: [] };
    }
  }

  private async sendMessage(toggleMessageDto: ToggleMessageDto) {
    const { sectionName, timestamp, customerId, routeId, sectionId, segmentId } = toggleMessageDto;
    if (!this.isSendingMessages) {
      return;
    }

    const edge_state = await this.generateEdgeState();

    for (let i = 0; i < routeId.length; i++) {
      const vehicle_info = {
        customer_id: customerId[0],
        topic: 'vehicle_info',
        data: {
          timestamp: timestamp || new Date().toISOString(),
          type: '압착진개차_5T',
          model: '5톤 덤프식',
          vendor: '에이엠특장',
          capacity_m3: 11,
          capacity_kg: 5600,
          operation_start: formatISO(new Date()),
          operation_end: 'n/a',
          dispatch_status: '첨단 1,2',
          last_maintenance: '2024-05-30',
          next_maintenance: '2024-08-30',
          usage: '생활',
          note: '적정량 준수',
        },
      };
 
      const collect_metrics = {
        customer_id: customerId[0],
        topic: 'collect_metrics', 
        data: {
          timestamp: timestamp || new Date().toISOString(),
          route_id: routeId[i],
          section_id: sectionId[i],
          section_name: sectionName[i],
          segment_id: segmentId[i],
          location: [36.423565, 127.407295],
          '5L_gen': [2.14, 9.14, 6.28],
          '10L_gen': [4.14, 28.74, 19.2],
          '10L_reu': [1.14, 8.1, 5.73],
          '20L_gen': [10.14, 170.86, 109.54],
          '20L_reu': [8.14, 143.21, 89.32],
          '30L_gen': [12.14, 302.27, 195.45],
          '50L_gen': [3.14, 148.22, 85.41],
          '50L_pub': [2.14, 94.72, 52.98],
          '75L_gen': [5.14, 312.74, 160.04],
          '75L_pub': [1.14, 68.56, 32.21],
          ext: [1.14, 38.4, 27.32],
          etc: [0.0, 0.0, 0.0],
        },
      };

      const zscore_rollup = {
        latest: {
          distanceRatios: null,
          durationRatios: null,
          collectDistance: null,
          collectDuration: null,
          collectCount: null,
        },
        mean: {
          distanceRatios: null,
          durationRatios: null,
          collectDistance: null,
          collectDuration: null,
          collectCount: null,
        },
        standardDeviation: {
          distanceRatios: null,
          durationRatios: null,
          collectDistance: null,
          collectDuration: null,
          collectCount: null,
        },
        rankScore: null,
        route_name: null,
        timestamp: timestamp || new Date().toISOString(),
      };

      const { route_info, drive_metrics } = await this.generateVehicleRouteAndDriveMetrics({
        customerId: customerId[0],
        routeId: routeId[i],
        sectionId: sectionId[i],
        segmentId: segmentId[i],
        sectionName: sectionName[i],
        timestamp: timestamp,
      });

      const dataMap = {
        drive_metrics: drive_metrics,
        vehicle_info: vehicle_info,
        route_info: route_info,
        edge_state: edge_state,
      };

      const queuesAndData = Config.rabbitmq.queues.map((queue) => {
        return { queue, data: dataMap[queue] };
      });

      if (!queuesAndData || queuesAndData.length === 0) {
        console.log('No queues or data to send.');
        return;
      }

      amqp.connect(
        `amqp://${this.configService.get<string>('RABBITMQ_USER')}:${this.configService.get<string>('RABBITMQ_PASS')}@${this.configService.get<string>('RABBITMQ_HOST')}`,
        (err, connection) => {
          if (err) throw err;
          connection.createChannel(async (err, channel) => {
            if (err) throw err;

            try {
              const promises = [];
              for (let j = 0; j < drive_metrics.length; j++) {
                const batch = drive_metrics[j];
                promises.push(
                  this.assertAndSendToQueue(
                    channel,
                    `${customerId[0]}.drive_metrics`,
                    batch,
                  ),
                );
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before sending the next coordinate
              } 

              promises.push(
                this.assertAndSendToQueue(
                  channel,
                  `${customerId[0]}.collect_metrics`,
                  collect_metrics,
                ),
              ); 

              if (i === 0) {
                promises.push(
                  this.assertAndSendToQueue(
                    channel,
                    `${customerId[0]}.vehicle_info`,
                    vehicle_info,
                  ),
                );
                promises.push(
                  this.assertAndSendToQueue(
                    channel,
                    `${customerId[0]}.edge_state`,
                    edge_state,
                  ),
                ); 
                promises.push(
                  this.assertAndSendToQueue(
                    channel,
                    `${customerId[0]}.zscore_rollup`,
                    zscore_rollup,
                  ),
                );
                promises.push(
                  this.assertAndSendToQueue(
                    channel,
                    `${customerId[0]}.route_info`,
                    route_info,
                  ),
                );
                this.isVehicleRouteSent = true; // Mark as sent
              }

              await Promise.all(promises);
            } catch (error) {
              console.error('Error sending messages:', error);
            }
          });
        },
      );
    }
  }

  toggleSendingMessages(toggleMessageDto: ToggleMessageDto) {
    this.isSendingMessages = toggleMessageDto.start;
  
    if (toggleMessageDto.start && !this.intervalId) {
      this.currentDriveMetricIndex = 0;
      this.lastMessageSentTime = new Date().getTime();
      this.intervalId = setInterval(async () => {
        if (!this.isGeneratingMetrics) {
          this.isGeneratingMetrics = true;
          try {
            this.sendMessage(toggleMessageDto);
          } catch (error) {
            console.error('Error generating vehicle route and drive metrics:', error);
          } finally {
            this.isGeneratingMetrics = false;
          }
        }
      }, 10000);
    } else if (!toggleMessageDto.start) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  
    // Connect to RabbitMQ
    this.connection = connect(
      [`amqp://${this.configService.get<string>('RABBITMQ_USER')}:${this.configService.get<string>('RABBITMQ_PASS')}@${this.configService.get<string>('RABBITMQ_HOST')}`]
    );
  
    const newArray = [
      `${toggleMessageDto.customerId}.drive_metrics`,
      `${toggleMessageDto.customerId}.collect_metrics`,
      `${toggleMessageDto.customerId}.vehicle_info`,
      `${toggleMessageDto.customerId}.edge_state`,
      `${toggleMessageDto.customerId}.zscore_rollup`,
      `${toggleMessageDto.customerId}.route_info`,
    ];
  
    this.channelWrapper = this.connection.createChannel({
      json: true,
      setup: (channel: Channel, callback: (err?: Error) => void) => {
        const setupAsync = async () => {
          try {
            for (const queue of newArray) {
              await channel.assertQueue(queue, { durable: true });
            }
            callback(); // success
          } catch (err) {
            callback(err as Error); // failure
          }
        };
  
        setupAsync();
      },
    });
  
    newArray.forEach((queue) => {
      this.channelWrapper.consume(queue, (msg) => {
        if (msg) {
          const data = JSON.parse(msg.content.toString());
          this.processMessage2(queue, data);
          this.channelWrapper.ack(msg);
        }
      });
    });
  }

  async generateEdgeState() {
    return {
      customer_id: "GS0",
      topic: "edge_state_metrics",
      data:
      {
        timestamp : new Date().toISOString(),
        route_id : 1,
        temperature : {
          cpu_avg_degree : 52.3,
          gpu_avg_degree : 54.68,
          soc_avg_degree : 47.25
        },
        utilization : {
          "cpu_avg_%": 52.3,
          "gpu_avg_%": 54.6,
          "mem_avg_%": 68.0,
          "disk_avg_%": 51.0
        },
        data_io : {
          lte_in_total_byte : 282000,
          lte_out_total_byte : 1984000,
          camera_total_byte : 145400000,
          dtg_total_byte : 2064000,
          disk_total_byte : 168800000
        }
      }
    }
  }

  async makeDispatchNO(length) {
    let result = '';
    const characters = 'SEJ';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return '20240531-' + result + '005';
  }

  async randomIntFromInterval(min, max) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
