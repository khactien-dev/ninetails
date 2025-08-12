import { Inject, Injectable } from '@nestjs/common';
import { IllegalDischargeSearchInput } from './illegal_discharge.dto';
import { CreateIllegalDischargeData } from '../fake-metric/fake-metric.dto';
var { Client } = require('@opensearch-project/opensearch');

@Injectable()
export class IllegalDischargeOpensearch {
  private client;
  constructor() {
    this.client = new Client({
      node: process.env.OPENSEARCH_SERVER,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }

  async save(input: CreateIllegalDischargeData) {
    try {
      const response = await this.client.update({
        id: input.data.id,
        index: `${input.customer_id}.illegal_discharges`,
        body: {
          doc: input,
          doc_as_upsert: true,
        },
      });
      return response;
    } catch (error) {}
  }

  async search(schema: string, input: IllegalDischargeSearchInput) {
    const MUST = [];
    MUST.push({
      match: {
        customer_id: schema,
      },
    });
    MUST.push({
      range: {
        'data.produce': {
          gte: input.start_date,
          lte: input.end_date,
        },
      },
    });

    if (input.route_name) {
      MUST.push({
        match: {
          'data.route_name': {
            query: input.route_name,
            operator: 'AND',
          },
        },
      });
    }
    const query = {
      query: { bool: { must: MUST } },
      aggs: {
        max: {
          max: {
            field: 'data.hour',
          },
        },
        min: {
          min: {
            field: 'data.hour',
          },
        },
        avg: {
          avg: {
            field: 'data.hour',
          },
        },
      },
    };

    const response = await this.client.search({
      index: `${schema}.illegal_discharges`,
      body: query,
    });

    return response;
  }

  async countCollection(
    schema: string,
    input: IllegalDischargeSearchInput,
    input2,
  ) {
    const MUST = [];
    MUST.push({
      match: {
        customer_id: schema,
      },
    });
    MUST.push({
      range: {
        'data.produce': {
          gte: input.start_date,
          lte: input.end_date,
        },
      },
    });
    MUST.push({
      range: {
        'data.produce': {
          gte: input2.start_date,
          lte: input2.end_date,
        },
      },
    });

    MUST.push({
      exists: {
        field: 'data.collection',
      },
    });

    if (input.route_name) {
      MUST.push({
        match: {
          'data.route_name': {
            query: input.route_name,
            operator: 'AND',
          },
        },
      });
    }
    const query = {
      query: { bool: { must: MUST } },
    };

    const response = await this.client.count({
      index: `${schema}.illegal_discharges`,
      body: query,
    });

    return response;
  }

  async countProduce(
    schema: string,
    input: IllegalDischargeSearchInput,
    input2,
  ) {
    const MUST = [];
    MUST.push({
      match: {
        customer_id: schema,
      },
    });
    MUST.push({
      range: {
        'data.produce': {
          gte: input.start_date,
          lte: input.end_date,
        },
      },
    });

    MUST.push({
      range: {
        'data.produce': {
          gte: input2.start_date,
          lte: input2.end_date,
        },
      },
    });

    if (input.route_name) {
      MUST.push({
        match: {
          'data.route_name': {
            query: input.route_name,
            operator: 'AND',
          },
        },
      });
    }
    const query = {
      query: {
        bool: {
          must: MUST,
          must_not: {
            exists: {
              field: 'data.collection',
            },
          },
        },
      },
    };

    const response = await this.client.count({
      index: `${schema}.illegal_discharges`,
      body: query,
    });

    return response;
  }

  async countClassificationProduce(
    schema: string,
    input: IllegalDischargeSearchInput,
  ) {
    const MUST = [];
    MUST.push({
      match: {
        customer_id: schema,
      },
    });
    MUST.push({
      range: {
        'data.produce': {
          gte: input.start_date,
          lte: input.end_date,
        },
      },
    });
    if (input.route_name) {
      MUST.push({
        match: {
          'data.route_name': {
            query: input.route_name,
            operator: 'AND',
          },
        },
      });
    }
    const query = {
      query: {
        bool: {
          must: MUST,
          must_not: {
            exists: {
              field: 'data.collection',
            },
          },
        },
      },
      aggs: {
        classification_count: {
          terms: {
            field: 'data.classification',
          },
        },
      },
    };
    const response = await this.client.search({
      index: `${schema}.illegal_discharges`,
      body: query,
    });
    return response;
  }

  async countClassificationCollection(
    schema: string,
    input: IllegalDischargeSearchInput,
  ) {
    const MUST = [];
    MUST.push({
      match: {
        customer_id: schema,
      },
    });
    MUST.push({
      range: {
        'data.produce': {
          gte: input.start_date,
          lte: input.end_date,
        },
      },
    });
    MUST.push({
      exists: {
        field: 'data.collection',
      },
    });
    if (input.route_name) {
      MUST.push({
        match: {
          'data.route_name': {
            query: input.route_name,
            operator: 'AND',
          },
        },
      });
    }
    const query = {
      query: {
        bool: {
          must: MUST,
        },
      },
      aggs: {
        classification_count: {
          terms: {
            field: 'data.classification',
          },
        },
      },
    };
    const response = await this.client.search({
      index: `${schema}.illegal_discharges`,
      body: query,
    });
    return response;
  }

  async lastUpdated(schema: string, input: IllegalDischargeSearchInput) {
    const MUST = [];
    MUST.push({
      match: {
        customer_id: schema,
      },
    });
    MUST.push({
      range: {
        'data.produce': {
          gte: input.start_date,
          lte: input.end_date,
        },
      },
    });

    if (input.route_name) {
      MUST.push({
        match: {
          'data.route_name': {
            query: input.route_name,
            operator: 'AND',
          },
        },
      });
    }
    const query1 = {
      query: { bool: { must: MUST } },
      size: 1,
      sort: [
        {
          'data.produce': { order: 'desc' },
        },
      ],
    };
    const response1 = await this.client.search({
      index: `${schema}.illegal_discharges`,
      body: query1,
    });

    MUST.push({
      exists: {
        field: 'data.collection',
      },
    });
    const query2 = {
      query: { bool: { must: MUST } },
      size: 1,
      sort: [
        {
          'data.collection': { order: 'desc' },
        },
      ],
    };
    const response2 = await this.client.search({
      index: `${schema}.illegal_discharges`,
      body: query2,
    });

    const product = response1.body.hits.total.value
      ? response1.body.hits.hits[0]._source.data.produce
      : null;
    const collection = response2.body.hits.total.value
      ? response2.body.hits.hits[0]._source.data.collection
      : null;

    return new Date(product) > new Date(collection) ? product : collection;
  }

  async exists(schema: string) {
    const indexExistsResponse = await this.client.indices.exists({
      index: `${schema}.illegal_discharges`,
    });
    if (indexExistsResponse.statusCode === 200) {
      return true;
    }
    return false;
  }
}
