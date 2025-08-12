import { BadRequestException, Logger } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { ApiResponseProperty } from '@nestjs/swagger';
import {
  ERROR_INFO,
  NUMBER_PAGE,
  SORTBY,
  UserStatus,
} from '../common/constants/common.constant';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { BaseQueryReq } from 'libs/dtos/base.req';
import { readFileSync, unlinkSync } from 'fs';
import { Workbook } from 'exceljs';
import * as moment from 'moment';

const iv = crypto.randomBytes(16);

export const getCommonMessageError = (error: any) =>
  error?.response?.data?.error?.message ??
  error?.response?.data?.message ??
  error?.response?.message ??
  error?.raw?.message ??
  (error?.driverError?.message || 'Something went wrong');

export const getCommonStatusCodeError = (error: any) =>
  error?.response?.statusCode;

export const logInfo = (functionName: string, content): void => {
  try {
    if (typeof content === 'string') {
      Logger.log(`[${functionName}]: ${content}`);
    } else {
      Logger.log(`[${functionName}] : ${JSON.stringify(content)}`);
    }
  } catch (error) {
    Logger.log(`[${functionName}] : <data is too big>`);
  }
};

export const logError = (functionName: string, error): void => {
  try {
    const logError: any = {
      message: error?.message,
      stack: error?.stack,
    };

    if (error?.response?.status) {
      logError.status = error.response.status;
    }

    if (error?.response?.data) {
      logError.data = error.response.data;
    }

    Logger.error(`[${functionName}]: ${JSON.stringify(logError)}`);
  } catch (error) {
    Logger.warn(`[${functionName}] : <data is too big>`);
  }
};

export const verifyToken = (token: string, secretKey: string) => {
  return verify(token, secretKey);
};

export class MessageResponse {
  @ApiResponseProperty()
  statusCode: number;
  @ApiResponseProperty()
  message: string;
}

/**
 * create common response object for application
 * @param content
 * @param metadata
 * @returns
 */
export function responseHelper<T>(
  data: T,
  success?: boolean,
  statusCode?: number,
  message?: string,
): MessageResponse {
  const res = {
    statusCode: 200,
    success: true,
    message: ERROR_INFO.SUCCESS,
    data: null,
  };
  res.data = data;
  if (statusCode) {
    res.statusCode = statusCode;
  }
  if (message) {
    res.message = message;
  }
  return res;
}

export const encryptHashedEmail = async (
  hashedEmail: string,
): Promise<string> => {
  console.log(process.env.SECRET_KEY_CRYPT);
  const keyHash = crypto
    .createHash('sha256')
    .update(process.env.SECRET_KEY_CRYPT, 'utf8')
    .digest('base64')
    .substr(0, 32);
  const cipher = crypto.createCipheriv(
    process.env.ALGORITHM,
    Buffer.from(keyHash),
    iv,
  );
  let encrypted = cipher.update(hashedEmail, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return encrypted;
};

export const decryptHashedEmail = async (
  encryptedHashedEmail: string,
): Promise<string> => {
  const keyHash = crypto
    .createHash('sha256')
    .update(process.env.SECRET_KEY_CRYPT, 'utf8')
    .digest('base64')
    .substr(0, 32);
  const decipher = crypto.createDecipheriv(
    process.env.ALGORITHM,
    Buffer.from(keyHash),
    iv,
  );
  let decrypted = decipher.update(encryptedHashedEmail, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

export const hashPassword = (orgPassword: string) => {
  return bcrypt.hashSync(orgPassword, 10);
};

export const setDefaultQuerySearchValues = (query: BaseQueryReq) => {
  query.page = query.page || NUMBER_PAGE.PAGE;
  query.pageSize = query.pageSize || NUMBER_PAGE.PAGE_SIZE;
  query.sortField = query.sortField || 'id';
  query.sortBy = query.sortBy
    ? (query.sortBy.toUpperCase() as SORTBY)
    : SORTBY.DESC;

  return query;
};

export const handlePaginate = (query: BaseQueryReq, defaulField?: string) => {
  const page = query.page || NUMBER_PAGE.PAGE;
  const pageSize = query.pageSize || NUMBER_PAGE.PAGE_SIZE;
  const sortField = query.sortField || defaulField || 'id';
  const sortBy = query.sortBy
    ? (query.sortBy.toUpperCase() as SORTBY)
    : SORTBY.DESC;

  return {
    take: pageSize,
    skip: (page - 1) * pageSize,
    order: { [sortField]: sortBy },
  };
};

export const fetchUserCreate = async (
  bearer: string,
  schema: string,
  data: {
    email: string;
    role: string;
    department: string;
    phone_number?: string;
    position: string;
    status: UserStatus;
    full_name: string;
  },
  masterId: number,
) => {
  const res = await fetch(process.env.APP_URL + '/api/user/create', {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: bearer,
      schema: schema,
      sync: 'false',
    },
    method: 'POST',
    body: JSON.stringify({
      email: data.email,
      role: data.role,
      department: data.department,
      phone_number: data.phone_number,
      position: data.position,
      status: data.status,
      full_name: data.full_name,
      master_id: masterId,
    }),
  });
  return res.json();
};

export const fetchUserUpdate = async (
  bearer: string,
  schema: string,
  id: number,
  data: any,
) => {
  const res = await fetch(
    process.env.USER_SERVICE_APP + '/api/user/update/' + id,
    {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: bearer,
        schema: schema,
        sync: 'false',
      },
      body: JSON.stringify({
        email: data.email,
        role: data.role,
        department: data.department,
        phone_number: data.phone_number,
        position: data.position,
        status: data.status,
        full_name: data.full_name,
      }),
    },
  );
  return res.json();
};

export const fetchUserDetail = async (
  bearer: string,
  schema: string,
  opId?: string,
) => {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: bearer,
    schema: schema,
    sync: 'false',
  };
  if (opId) headers['opId'] = opId;
  const res = await fetch(process.env.APP_URL + '/api/user/detail', {
    method: 'GET',
    headers,
  });
  return res.json();
};

export const randomPassword = () => {
  const lowerCase = 'abcdefghk';
  const upperCase = 'ABCDEFGHK';
  const numbs = '123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    if (i == 0) password += upperCase[Math.floor(Math.random() * 9)];
    if (i == 1) password += numbs[Math.floor(Math.random() * 9)];
    if (i == 2) password += '@!$'[Math.floor(Math.random() * 3)];
    if (i > 2) password += lowerCase[Math.floor(Math.random() * 9)];
  }
  return password;
};

export const getCurrentDate = (date = new Date()) => {
  return (
    date.getUTCFullYear() +
    '-' +
    ('00' + (date.getUTCMonth() + 1)).slice(-2) +
    '-' +
    ('00' + date.getUTCDate()).slice(-2) +
    ' ' +
    ('00' + date.getUTCHours()).slice(-2) +
    ':' +
    ('00' + date.getUTCMinutes()).slice(-2) +
    ':' +
    ('00' + date.getUTCSeconds()).slice(-2)
  );
};

export const createSchema = (name: string) => {
  return (
    `SET statement_timeout = 0;
          SET lock_timeout = 0;
          SET idle_in_transaction_session_timeout = 0;
          SET client_encoding = 'UTF8';
          SET standard_conforming_strings = on;
          SELECT pg_catalog.set_config('search_path', '', false);
          SET check_function_bodies = false;
          SET xmloption = content;
          SET client_min_messages = warning;
          SET row_security = off;` +
    //Create Schema
    `create schema "${name}";
          ALTER SCHEMA "${name}" OWNER TO "${process.env.DATABASE_USERNAME}";` +
    // Create table staff
    `CREATE TABLE "${name}".staff (
            created_at timestamp without time zone DEFAULT now(),
            updated_at timestamp without time zone DEFAULT now(),
            deleted_at timestamp without time zone,
            id integer,
            name character varying,
            phone_number character varying,
            age timestamp without time zone,
            driver_license character varying,
            start_date timestamp without time zone,
            end_date timestamp without time zone,
            job_contract character varying,
            status character varying,
            note character varying
          );
          ALTER TABLE "${name}".staff OWNER TO "${process.env.DATABASE_USERNAME}";
          CREATE SEQUENCE "${name}".staff_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
          ALTER TABLE "${name}".staff_id_seq OWNER TO "${process.env.DATABASE_USERNAME}";
          ALTER SEQUENCE "${name}".staff_id_seq OWNED BY "${name}".staff.id;
          ALTER TABLE ONLY "${name}".staff ALTER COLUMN id SET DEFAULT nextval('"${name}".staff_id_seq'::regclass);` +
    // Create table users
    `CREATE TABLE "${name}".users (
            created_at timestamp without time zone DEFAULT now(),
            updated_at timestamp without time zone DEFAULT now(),
            deleted_at timestamp without time zone,
            id integer,
            full_name character varying,
            email character varying,
            phone_number character varying,
            role character varying,
            staff_id integer,
            department integer,
            position integer,
            status integer,
            master_id integer
          );
          ALTER TABLE "${name}".users OWNER TO "${process.env.DATABASE_USERNAME}";
          CREATE SEQUENCE "${name}".users_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
          ALTER TABLE "${name}".users_id_seq OWNER TO "${process.env.DATABASE_USERNAME}";
          ALTER SEQUENCE "${name}".users_id_seq OWNED BY "${name}".users.id;
          ALTER TABLE ONLY "${name}".users ALTER COLUMN id SET DEFAULT nextval('"${name}".users_id_seq'::regclass);` +
    // Create table vehicle
    `CREATE TABLE "${name}".vehicle (
            created_at timestamp without time zone DEFAULT now(),
            updated_at timestamp without time zone DEFAULT now(),
            deleted_at timestamp without time zone,
            id integer,
            vehicle_number character varying,
            vehicle_type bigint,
            vehicle_model bigint,
            manufacturer bigint,
            operation_start_date timestamp without time zone,
            operation_end_date timestamp without time zone,
            capacity bigint,
            max_capacity bigint,
            recent_maintenance timestamp without time zone,
            next_maintenance timestamp without time zone,
            special_features bigint,
            purpose character varying,
            note character varying,
            status character varying
          );
          ALTER TABLE "${name}".vehicle OWNER TO "${process.env.DATABASE_USERNAME}";
          CREATE SEQUENCE "${name}".vehicle_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
          ALTER TABLE "${name}".vehicle_id_seq OWNER TO "${process.env.DATABASE_USERNAME}";
          ALTER SEQUENCE "${name}".vehicle_id_seq OWNED BY "${name}".vehicle.id;
          ALTER TABLE ONLY "${name}".vehicle ALTER COLUMN id SET DEFAULT nextval('"${name}".vehicle_id_seq'::regclass);` +
    // Create table setting-notification
    `CREATE TABLE "${name}".setting_notification (
      created_at timestamp without time zone DEFAULT now(),
      updated_at timestamp without time zone DEFAULT now(),
      deleted_at timestamp without time zone,
      id integer,
      start_operate boolean DEFAULT TRUE,
      end_operate boolean DEFAULT TRUE,
      to_trash_collection_point boolean DEFAULT TRUE,
      to_landfill boolean DEFAULT TRUE,
      complete_route boolean DEFAULT TRUE,
      back_to_parking boolean DEFAULT TRUE,
      start_other_operations boolean DEFAULT TRUE,
      end_other_operations boolean DEFAULT TRUE,
      start_standby_state boolean DEFAULT TRUE,
      end_standby_state boolean DEFAULT TRUE,
      lost_signal boolean DEFAULT TRUE,
      reconnect_signal boolean DEFAULT TRUE,
      user_id integer
     );
    ALTER TABLE "${name}".setting_notification OWNER TO "${process.env.DATABASE_USERNAME}";
    CREATE SEQUENCE "${name}".setting_notification_id_seq
      AS integer
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
      CACHE 1;
    ALTER TABLE "${name}".setting_notification_id_seq OWNER TO "${process.env.DATABASE_USERNAME}";
    ALTER SEQUENCE "${name}".setting_notification_id_seq OWNED BY "${name}".setting_notification.id;
    ALTER TABLE ONLY "${name}".setting_notification ALTER COLUMN id SET DEFAULT nextval('"${name}".setting_notification_id_seq'::regclass);` +
    // Create table combo_box
    `CREATE TABLE "${name}".combo_box (
            created_at timestamp without time zone DEFAULT now(),
            updated_at timestamp without time zone DEFAULT now(),
            deleted_at timestamp without time zone,
            id integer,
            "field" character varying,
            "data" character varying
          );
          ALTER TABLE "${name}".combo_box OWNER TO "${process.env.DATABASE_USERNAME}";
          CREATE SEQUENCE "${name}".combo_box_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
          ALTER TABLE "${name}".combo_box_id_seq OWNER TO "${process.env.DATABASE_USERNAME}";
          ALTER SEQUENCE "${name}".combo_box_id_seq OWNED BY "${name}".combo_box.id;
          ALTER TABLE ONLY "${name}".combo_box ALTER COLUMN id SET DEFAULT nextval('"${name}".combo_box_id_seq'::regclass);` +
    // Create table notification
    `CREATE TABLE "${name}".notification (
            created_at timestamp DEFAULT now(),
            updated_at timestamp DEFAULT now() NULL,
            deleted_at timestamp NULL,
            id integer,
            icon varchar,
            "type" varchar,
            title varchar,
            body text,
            read_at timestamp NULL,
            user_id integer NULL
          );
          ALTER TABLE "${name}".notification OWNER TO "${process.env.DATABASE_USERNAME}";
          CREATE SEQUENCE "${name}".notification_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
          ALTER TABLE "${name}".notification_id_seq OWNER TO "${process.env.DATABASE_USERNAME}";
          ALTER SEQUENCE "${name}".notification_id_seq OWNED BY "${name}".notification.id;
          ALTER TABLE ONLY "${name}".notification ALTER COLUMN id SET DEFAULT nextval('"${name}".notification_id_seq'::regclass);` +
    // Create table working_schedule
    `CREATE TABLE "${name}".dispatches (
        created_at timestamp without time zone DEFAULT now(),
        updated_at timestamp without time zone DEFAULT now(),
        deleted_at timestamp without time zone,
        id integer NOT NULL,
        dispatch_no character varying,
        date DATE,
        route_type character varying,
        route_id integer,
        vehicle_id integer,
        alt_vehicle_id integer,
        driver_id integer,
        alt_driver_id integer,
        crew1_id integer,
        alt_crew1_id integer,
        crew2_id integer,
        alt_crew2_id integer
    );
    ALTER TABLE "${name}".dispatches OWNER TO "${process.env.DATABASE_USERNAME}";
    CREATE SEQUENCE "${name}".dispatches_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
    ALTER TABLE "${name}".dispatches_id_seq OWNER TO "${process.env.DATABASE_USERNAME}";
    ALTER SEQUENCE "${name}".dispatches_id_seq OWNED BY "${name}".dispatches.id;
    ALTER TABLE ONLY "${name}".dispatches ALTER COLUMN id SET DEFAULT nextval('"${name}".dispatches_id_seq'::regclass);` +
    // Create table logo
    `CREATE TABLE "${name}".logo (
        created_at timestamp without time zone DEFAULT now(),
        updated_at timestamp without time zone DEFAULT now(),
        deleted_at timestamp without time zone,
        id integer NOT NULL,
        image character varying,
        name character varying
    );
    ALTER TABLE "${name}".logo OWNER TO "${process.env.DATABASE_USERNAME}";
    CREATE SEQUENCE "${name}".logo_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
    ALTER TABLE "${name}".logo_id_seq OWNER TO "${process.env.DATABASE_USERNAME}";
    ALTER SEQUENCE "${name}".logo_id_seq OWNED BY "${name}".logo.id;
    ALTER TABLE ONLY "${name}".logo ALTER COLUMN id SET DEFAULT nextval('"${name}".logo_id_seq'::regclass);` +
    // Create table absence_staff
    `CREATE TABLE "${name}".absence_staff (
        created_at timestamp without time zone DEFAULT now(),
        updated_at timestamp without time zone DEFAULT now(),
        deleted_at timestamp without time zone,
        id integer NOT NULL,
        absence_staff_id integer,
        absence_type character varying,
        replacer_staff_id integer,
        start_date timestamp without time zone,
        end_date timestamp without time zone,
        period character varying,
        repeat character varying,
        repeat_days_week character varying,
        repeat_days_month character varying,
        other character varying
    );
    ALTER TABLE "${name}".absence_staff OWNER TO "${process.env.DATABASE_USERNAME}";
    CREATE SEQUENCE "${name}".absence_staff_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
    ALTER TABLE "${name}".absence_staff_id_seq OWNER TO "${process.env.DATABASE_USERNAME}";
    ALTER SEQUENCE "${name}".absence_staff_id_seq OWNED BY "${name}".absence_staff.id;
    ALTER TABLE ONLY "${name}".absence_staff ALTER COLUMN id SET DEFAULT nextval('"${name}".absence_staff_id_seq'::regclass);` +
    // Create table metric_weight
    `
    CREATE TABLE "${name}".metric_weight (
      created_at timestamp without time zone DEFAULT now(),
      updated_at timestamp without time zone DEFAULT now(),
      deleted_at timestamp without time zone,
      id integer NOT NULL,
      distanceRatioRate float DEFAULT 0.15,
      durationRatioRate float DEFAULT 0.15,
      collectDistanceRate float DEFAULT 0.15,
      collectDurationRate float DEFAULT 0.15,
      collectCountRate float DEFAULT 0.3,
      manualCollectTimeRate float DEFAULT 0.1,
      alpha float DEFAULT 0.1,
      pValue float DEFAULT 0.05,
      percentageAE float DEFAULT 0.1,
      percentageBD float DEFAULT 0.2,
      percentageC float DEFAULT 0.4
    );
    ALTER TABLE "${name}".metric_weight OWNER TO "${process.env.DATABASE_USERNAME}";
    CREATE SEQUENCE "${name}".metric_weight_id_seq
      AS integer
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
      CACHE 1;
    ALTER TABLE "${name}".metric_weight_id_seq OWNER TO "${process.env.DATABASE_USERNAME}";
    ALTER SEQUENCE "${name}".metric_weight_id_seq OWNED BY "${name}".metric_weight.id;
    ALTER TABLE ONLY "${name}".metric_weight ALTER COLUMN id SET DEFAULT nextval('"${name}".metric_weight_id_seq'::regclass);`
  );
};

export function formatLastLogin(lastLogin: string | Date): string {
  if (lastLogin == null) {
    return null;
  }

  const now = new Date();
  const lastLoginDate = new Date(lastLogin);
  const diffInSeconds = Math.floor(
    (now.getTime() - lastLoginDate.getTime()) / 1000,
  );

  const minutes = Math.floor(diffInSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const years = Math.floor(days / 365);

  if (minutes < 60) {
    return `${minutes} 분 전`;
  } else if (hours < 24) {
    return `${hours} 시간 전`;
  } else if (days < 365) {
    return `${days} 일 전`;
  } else {
    return `${years} 년 전`;
  }
}

export function convertToArray(value: string): string[] {
  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim());
  }
  return [];
}

export function convertToArrayNumber(value: number): number[] {
  // Kiểm tra nếu giá trị là số hợp lệ
  if (typeof value === 'number' && !isNaN(value)) {
    return [value];
  }
  // Nếu giá trị không hợp lệ, trả về mảng rỗng
  return [];
}

export function formatDate(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const approvedIndex = async (schema: string) => {
  const res = await fetch(
    `${process.env.APP_URL}/api/base-metric/approved-index-name`,
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({ schema: schema }),
    },
  );
  return res.json();
};

export const checkDayOfRepeatWeekly = (
  day: string,
  workingDate: string,
  startDate: Date,
) => {
  const indexDay = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
  ].findIndex((i) => i === day);
  const currWeek = moment(workingDate).startOf('week');
  const startWeek = moment(startDate).startOf('week');
  const space = currWeek.valueOf() - startWeek.valueOf();
  const dateOfDay = moment(startDate)
    .startOf('week')
    .add(space)
    .day(indexDay + 1)
    .format('YYYY-MM-DD 00:00:00');
  if (dateOfDay === workingDate) {
    throw new BadRequestException({
      message: 'This staff is unavailable. Please choose another staff!',
      error: 'Bad Request',
      statusCode: 400,
    });
  }
};
