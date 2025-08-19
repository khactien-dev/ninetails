master-service            |     at async SelectQueryBuilder.getRawOne (/usr/src/app/node_modules/typeorm/query-builder/src/query-builder/SelectQueryBuilder.ts:1604:17)
master-service            |     at async UserMasterService.findOne (/usr/src/app/apps/master-service/src/user-master/user-master.service.ts:479:17)
master-service            |     at async AuthController.login (/usr/src/app/apps/master-service/src/user-master/auth.controller.ts:40:18) {
master-service            |   query: `SELECT "um"."created_at" AS "um_created_at", "um"."updated_at" AS "um_updated_at", "um"."deleted_at" AS "um_deleted_at", "um"."id" AS "um_id", "um"."email" AS "um_email", "um"."password" AS "um_password", "um"."role" AS "um_role", "um"."full_name" AS "um_full_name", "um"."phone_number" AS "um_phone_number", "um"."tenant_id" AS "um_tenant_id", "um"."permission_id" AS "um_permission_id", "um"."last_login" AS "um_last_login", "t"."created_at" AS "t_created_at", "t"."updated_at" AS "t_updated_at", "t"."deleted_at" AS "t_deleted_at", "t"."id" AS "t_id", "t"."organization" AS "t_organization", "t"."department" AS "t_department", "t"."operator" AS "t_operator", "t"."position" AS "t_position", "t"."email" AS "t_email", "t"."phone" AS "t_phone", "t"."proof1" AS "t_proof1", "t"."filename_proof1" AS "t_filename_proof1", "t"."proof2" AS "t_proof2", "t"."filename_proof2" AS "t_filename_proof2", "t"."schema" AS "t_schema", "t"."token" AS "t_token", "t"."approved_time" AS "t_approved_time", "t"."send_mail_at" AS "t_send_mail_at", "t"."is_backup" AS "t_is_backup", PGP_SYM_DECRYPT(um.full_name::bytea, 'netvisionkey') AS "full_name", PGP_SYM_DECRYPT(um.phone_number::bytea, 'netvisionkey') AS "phone_number" FROM "users_master" "um" LEFT JOIN "tenant" "t" ON "t"."id"="um"."tenant_id" AND ("t"."deleted_at" IS NULL) WHERE ( "um"."email" = 'admin@gmail.com' ) AND ( "um"."deleted_at" IS NULL )`,
master-service            |   parameters: [],
master-service            |   driverError: error: Wrong key or corrupt data
master-service            |       at /usr/src/app/node_modules/pg/lib/client.js:545:17
master-service            |       at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
master-service            |       at async PostgresQueryRunner.query (/usr/src/app/node_modules/typeorm/driver/src/driver/postgres/PostgresQueryRunner.ts:254:25)
master-service            |       at async SelectQueryBuilder.loadRawResults (/usr/src/app/node_modules/typeorm/query-builder/src/query-builder/SelectQueryBuilder.ts:3808:25)
master-service            |       at async SelectQueryBuilder.getRawMany (/usr/src/app/node_modules/typeorm/query-builder/src/query-builder/SelectQueryBuilder.ts:1627:29)
master-service            |       at async SelectQueryBuilder.getRawOne (/usr/src/app/node_modules/typeorm/query-builder/src/query-builder/SelectQueryBuilder.ts:1604:17)
master-service            |       at async UserMasterService.findOne (/usr/src/app/apps/master-service/src/user-master/user-master.service.ts:479:17)
master-service            |       at async AuthController.login (/usr/src/app/apps/master-service/src/user-master/auth.controller.ts:40:18) {
master-service            |     length: 80,
master-service            |     severity: 'ERROR',
master-service            |     code: '39000',
master-service            |     detail: undefined,
master-service            |     hint: undefined,
master-service            |     position: undefined,
master-service            |     internalPosition: undefined,
master-service            |     internalQuery: undefined,
master-service            |     where: undefined,
master-service            |     schema: undefined,
master-service            |     table: undefined,
master-service            |     column: undefined,
master-service            |     dataType: undefined,
master-service            |     constraint: undefined,
master-service            |     file: 'px.c',
master-service            |     line: '104',
master-service            |     routine: 'px_THROW_ERROR'
master-service            |   },
master-service            |   length: 80,
master-service            |   severity: 'ERROR',
master-service            |   code: '39000',
master-service            |   detail: undefined,
master-service            |   hint: undefined,
master-service            |   position: undefined,
master-service            |   internalPosition: undefined,
master-service            |   internalQuery: undefined,
master-service            |   where: undefined,
master-service            |   schema: undefined,
master-service            |   table: undefined,
master-service            |   column: undefined,
master-service            |   dataType: undefined,
master-service            |   constraint: undefined,
master-service            |   file: 'px.c',
master-service            |   line: '104',
master-service            |   routine: 'px_THROW_ERROR'
master-service            | }
master-service            | [master-api-service] {"url":"/api/auth/login","query":{},"body":{"email":"admin@gmail.com","password":"Admin@12345"}}
master-service            | [master-api-service] {"success":false,"code":500,"message":"Wrong key or corrupt data"}
pgAdmin                   | ::ffff:192.168.16.31 - - [18/Aug/2025:03:32:56 +0000] "POST /misc/cleanup HTTP/1.1" 200 0 "http://192.168.16.6:5050/browser/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"
pgAdmin                   | ::ffff:192.168.16.31 - - [18/Aug/2025:03:32:56 +0000] "GET /dashboard/dashboard_stats/1/16384?chart_names=session_stats,tps_stats,ti_stats,to_stats,bio_stats HTTP/1.1" 401 127 "http://192.168.16.6:5050/browser/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"
notification-api-service  | [Nest] 37  - 08/18/2025, 3:33:00 AM   ERROR [Scheduler] TypeError: Cannot read properties of undefined (reading 'getConsumers')
opensearch                | [2025-08-18T03:33:04,762][INFO ][o.o.m.c.MLSyncUpCron     ] [opensearch] Skipping sync up job - ML model index not found
notification-api-service  | [Nest] 37  - 08/18/2025, 3:33:05 AM   ERROR [Scheduler] TypeError: Cannot read properties of undefined (reading 'getConsumers')
notification-api-service  | [Nest] 37  - 08/18/2025, 3:33:10 AM   ERROR [Scheduler] TypeError: Cannot read properties of undefined (reading 'getConsumers')
opensearch                | [2025-08-18T03:33:14,764][INFO ][o.o.m.c.MLSyncUpCron     ] [opensearch] Skipping sync up job - ML model index not found
notification-api-service  | [Nest] 37  - 08/18/2025, 3:33:15 AM   ERROR [Scheduler] TypeError: Cannot read properties of undefined (reading 'getConsumers')
notification-api-service  | [Nest] 37  - 08/18/2025, 3:33:20 AM   ERROR [Scheduler] TypeError: Cannot read properties of undefined (reading 'getConsumers')
opensearch                | [2025-08-18T03:33:24,765][INFO ][o.o.m.c.MLSyncUpCron     ] [opensearch] Skipping sync up job - ML model index not found
notification-api-service  | [Nest] 37  - 08/18/2025, 3:33:25 AM   ERROR [Scheduler] TypeError: Cannot read properties of undefined (reading 'getConsumers')
notification-api-service  | [Nest] 37  - 08/18/2025, 3:33:30 AM   ERROR [Scheduler] TypeError: Cannot read properties of undefined (reading 'getConsumers')
opensearch                | [2025-08-18T03:33:34,767][INFO ][o.o.m.c.MLSyncUpCron     ] [opensearch] Skipping sync up job - ML model index not found
notification-api-service  | [Nest] 37  - 08/18/2025, 3:33:35 AM   ERROR [Scheduler] TypeError: Cannot read properties of undefined (reading 'getConsumers')
notification-api-service  | [Nest] 37  - 08/18/2025, 3:33:40 AM   ERROR [Scheduler] TypeError: Cannot read properties of undefined (reading 'getConsumers')
opensearch                | [2025-08-18T03:33:44,768][INFO ][o.o.m.c.MLSyncUpCron     ] [opensearch] Skipping sync up job - ML model index not found
notification-api-service  | [Nest] 37  - 08/18/2025, 3:33:45 AM   ERROR [Scheduler] TypeError: Cannot read properties of undefined (reading 'getConsumers')
notification-api-service  | [Nest] 37  - 08/18/2025, 3:33:50 AM   ERROR [Scheduler] TypeError: Cannot read properties of undefined (reading 'getConsumers')
opensearch                | [2025-08-18T03:33:54,769][INFO ][o.o.m.c.MLSyncUpCron     ] [opensearch] Skipping sync up job - ML model index not found
notification-api-service  | [Nest] 37  - 08/18/2025, 3:33:55 AM   ERROR [Scheduler] TypeError: Cannot read properties of undefined (reading 'getConsumers')
pgAdmin                   | ::ffff:192.168.16.31 - - [18/Aug/2025:03:33:56 +0000] "GET /dashboard/dashboard_stats/1/16384?chart_names=session_stats,tps_stats,ti_stats,to_stats,bio_stats HTTP/1.1" 401 127 "http://192.168.16.6:5050/browser/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"
notification-api-service  | [Nest] 37  - 08/18/2025, 3:34:00 AM   ERROR [Scheduler] TypeError: Cannot read properties of undefined (reading 'getConsumers')
opensearch                | [2025-08-18T03:34:04,770][INFO ][o.o.m.c.MLSyncUpCron     ] [opensearch] Skipping sync up job - ML model index not found
notification-api-service  | [Nest] 37  - 08/18/2025, 3:34:05 AM   ERROR [Scheduler] TypeError: Cannot read properties of undefined (reading 'getConsumers')
notification-api-service  | [Nest] 37  - 08/18/2025, 3:34:10 AM   ERROR [Scheduler] TypeError: Cannot read properties of undefined (reading 'getConsumers')
