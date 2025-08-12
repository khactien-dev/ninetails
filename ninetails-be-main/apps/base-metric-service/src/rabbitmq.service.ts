import { Injectable } from '@nestjs/common';
import * as amqp from 'amqp-connection-manager';
import { BaseData, CollectMetricData, DriveMetricData, EdgeStateData } from './fake-metric/fake-metric.dto';

@Injectable()
export class RabbitmqService {
  constructor() {}

  async producer(message: BaseData) {
    const RABBITMQ_USER = process.env.RABBITMQ_USER;
    const RABBITMQ_PASS = process.env.RABBITMQ_PASS;
    const RABBITMQ_HOST = process.env.RABBITMQ_HOST;
    const connection = amqp.connect([
      `amqp://${RABBITMQ_USER}:${RABBITMQ_PASS}@${RABBITMQ_HOST}`,
    ]);
    const channelWrapper = connection.createChannel({
      json: true,
      setup: function (channel: amqp.Channel) {
        return channel.assertExchange(
          `${message.customer_id}.exchange`,
          'direct',
          {
            durable: true,
          },
        );
        // channel.assertQueue(`${message.customer_id}.${message.topic}.que`, {
        //   durable: true,
        // });
      },
    });
    // const result = channelWrapper
    //   .sendToQueue(message.customer_id + '.' + message.topic, message, {
    //     persistent: true,
    //   })
    //   .then(function (value) {
    //     return value;
    //   })
    //   .catch(function (err) {
    //     throw err;
    //   });
    const result = channelWrapper.publish(
      `${message.customer_id}.exchange`,
      `${message.topic}.key`,
      message,
    );
    return result;
  }

  async producerDrive(
    message: DriveMetricData | CollectMetricData | EdgeStateData,
    info: {
      customer_id: string;
      topic: string;
    },
  ) {
    const RABBITMQ_USER = process.env.RABBITMQ_USER;
    const RABBITMQ_PASS = process.env.RABBITMQ_PASS;
    const RABBITMQ_HOST = process.env.RABBITMQ_HOST;
    const connection = amqp.connect([
      `amqp://${RABBITMQ_USER}:${RABBITMQ_PASS}@${RABBITMQ_HOST}`,
    ]);
    const channelWrapper = connection.createChannel({
      json: true,
      setup: function (channel: amqp.Channel) {
        return channel.assertExchange(
          `${info.customer_id}.exchange`,
          'direct',
          {
            durable: true,
          },
        );
      },
    });
    const result = channelWrapper.publish(
      `${info.customer_id}.exchange`,
      `${info.topic}.key`,
      message,
    );
    return result;
  }

  // async consumer() {
  //   const RABBITMQ_USER = process.env.RABBITMQ_USER;
  //   const RABBITMQ_PASS = process.env.RABBITMQ_PASS;
  //   const RABBITMQ_HOST = process.env.RABBITMQ_HOST;
  //   const connection = amqp.connect([
  //     `amqp://${RABBITMQ_USER}:${RABBITMQ_PASS}@${RABBITMQ_HOST}`,
  //   ]);
  //   const channelWrapper = connection.createChannel({
  //     json: true,
  //     setup: function (channel) {
  //       return channel.assertQueue('drive_metric_queue', { durable: true });
  //     },
  //   });
  //   const result = await channelWrapper
  //     .consume('drive_metric_queue', async (msg) => {
  //       if (!msg) return;
  //       const data = JSON.parse(msg.content.toString());
  //     })
  //     .then(function (data) {
  //       return data;
  //     })
  //     .catch(function (err) {
  //       throw err;
  //     });
  //   return result;
  // }
}
