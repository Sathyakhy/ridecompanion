import { relations } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(), // Firebase Auth UID
  email: text("email").notNull(),
  displayName: text("display_name"),
  photoUrl: text("photo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Bikes / Motorcycles
export const bikes = pgTable("bikes", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // references users.uid
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  nickname: text("nickname"),
  vin: text("vin"),
  licensePlate: text("license_plate"),
  currentMileage: integer("current_mileage").default(0).notNull(),
  mileageUnit: text("mileage_unit").default("km").notNull(),
  notes: text("notes"),
  isPrimary: boolean("is_primary").default(false).notNull(),
  photoUrl: text("photo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Maintenance Records
export const maintenanceRecords = pgTable("maintenance_records", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  bikeId: integer("bike_id")
    .references(() => bikes.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  serviceDate: text("service_date").notNull(), // YYYY-MM-DD
  mileage: integer("mileage").notNull(),
  cost: doublePrecision("cost").default(0).notNull(),
  performedBy: text("performed_by").default("DIY").notNull(),
  partsReplaced: text("parts_replaced"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Service Schedules
export const serviceSchedules = pgTable("service_schedules", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  bikeId: integer("bike_id")
    .references(() => bikes.id, { onDelete: "cascade" })
    .notNull(),
  taskName: text("task_name").notNull(),
  intervalMiles: integer("interval_miles"),
  intervalMonths: integer("interval_months"),
  lastPerformedMileage: integer("last_performed_mileage"),
  lastPerformedDate: text("last_performed_date"),
  nextDueMileage: integer("next_due_mileage"),
  nextDueDate: text("next_due_date"),
  priority: text("priority").default("medium").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Fuel Logs
export const fuelLogs = pgTable("fuel_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  bikeId: integer("bike_id")
    .references(() => bikes.id, { onDelete: "cascade" })
    .notNull(),
  logDate: text("log_date").notNull(),
  mileage: integer("mileage").notNull(),
  fuelVolume: doublePrecision("fuel_volume").notNull(),
  fuelUnit: text("fuel_unit").default("L").notNull(),
  totalCost: doublePrecision("total_cost").notNull(),
  pricePerUnit: doublePrecision("price_per_unit"),
  octane: integer("octane"),
  fullTank: boolean("full_tank").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Expenses
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  bikeId: integer("bike_id")
    .references(() => bikes.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  expenseDate: text("expense_date").notNull(),
  cost: doublePrecision("cost").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Reminders
export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  bikeId: integer("bike_id").references(() => bikes.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  dueDate: text("due_date"),
  dueMileage: integer("due_mileage"),
  isCompleted: boolean("is_completed").default(false).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  bikes: many(bikes),
  maintenanceRecords: many(maintenanceRecords),
  serviceSchedules: many(serviceSchedules),
  fuelLogs: many(fuelLogs),
  expenses: many(expenses),
  reminders: many(reminders),
}));

export const bikesRelations = relations(bikes, ({ many }) => ({
  maintenanceRecords: many(maintenanceRecords),
  serviceSchedules: many(serviceSchedules),
  fuelLogs: many(fuelLogs),
  expenses: many(expenses),
  reminders: many(reminders),
}));

export const maintenanceRecordsRelations = relations(maintenanceRecords, ({ one }) => ({
  bike: one(bikes, {
    fields: [maintenanceRecords.bikeId],
    references: [bikes.id],
  }),
}));

export const serviceSchedulesRelations = relations(serviceSchedules, ({ one }) => ({
  bike: one(bikes, {
    fields: [serviceSchedules.bikeId],
    references: [bikes.id],
  }),
}));

export const fuelLogsRelations = relations(fuelLogs, ({ one }) => ({
  bike: one(bikes, {
    fields: [fuelLogs.bikeId],
    references: [bikes.id],
  }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  bike: one(bikes, {
    fields: [expenses.bikeId],
    references: [bikes.id],
  }),
}));

export const remindersRelations = relations(reminders, ({ one }) => ({
  bike: one(bikes, {
    fields: [reminders.bikeId],
    references: [bikes.id],
  }),
}));
