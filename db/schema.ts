import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const studio=sqliteTable('studio',{id:text('id').primaryKey(),value:text('value').notNull(),expires:integer('expires').notNull().default(0)});
