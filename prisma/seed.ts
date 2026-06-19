import { prisma } from "../src/lib/db/prisma";

async function main() {
  await prisma.shiftSlot.deleteMany();
  await prisma.schedulePeriod.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.templateRule.deleteMany();

  await prisma.employee.createMany({
    data: [
      {
        id: "11111111-1111-4111-8111-111111111111",
        firstName: "Anna",
        lastName: "Keller",
        position: "DOCTOR",
        departments: ["ER", "ICU"],
        status: "ACTIVE",
      },
      {
        id: "22222222-2222-4222-8222-222222222222",
        firstName: "Markus",
        lastName: "Weber",
        position: "NURSE",
        departments: ["ER"],
        status: "ACTIVE",
      },
      {
        id: "33333333-3333-4333-8333-333333333333",
        firstName: "Lea",
        lastName: "Schmidt",
        position: "DOCTOR",
        departments: ["ICU"],
        status: "ACTIVE",
      },
      {
        id: "44444444-4444-4444-8444-444444444444",
        firstName: "Tom",
        lastName: "Fischer",
        position: "NURSE",
        departments: ["ICU"],
        status: "ACTIVE",
      },
      {
        id: "55555555-5555-4555-8555-555555555555",
        firstName: "Mira",
        lastName: "Vogel",
        position: "SURGEON",
        departments: ["SURGERY"],
        status: "ACTIVE",
      },
      {
        id: "66666666-6666-4666-8666-666666666666",
        firstName: "Jonas",
        lastName: "Brandt",
        position: "NURSE",
        departments: ["SURGERY"],
        status: "DISABLED",
      },
    ],
  });

  await prisma.schedulePeriod.create({
    data: {
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      department: "ER",
      startDate: new Date("2026-05-04T00:00:00.000Z"),
      endDate: new Date("2026-05-10T23:59:59.999Z"),
      published: false,
      shiftSlots: {
        create: [
          {
            id: "aaaa1111-1111-4111-8111-aaaaaaaa1111",
            department: "ER",
            position: "DOCTOR",
            startTime: new Date("2026-05-04T08:00:00.000Z"),
            endTime: new Date("2026-05-04T16:00:00.000Z"),
            employeeId: null,
          },
          {
            id: "aaaa2222-2222-4222-8222-aaaaaaaa2222",
            department: "ER",
            position: "NURSE",
            startTime: new Date("2026-05-04T08:00:00.000Z"),
            endTime: new Date("2026-05-04T16:00:00.000Z"),
            employeeId: "22222222-2222-4222-8222-222222222222",
          },
        ],
      },
    },
  });

  await prisma.schedulePeriod.create({
    data: {
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      department: "ICU",
      startDate: new Date("2026-05-11T00:00:00.000Z"),
      endDate: new Date("2026-05-17T23:59:59.999Z"),
      published: true,
      shiftSlots: {
        create: [
          {
            id: "bbbb1111-1111-4111-8111-bbbbbbbb1111",
            department: "ICU",
            position: "DOCTOR",
            startTime: new Date("2026-05-11T08:00:00.000Z"),
            endTime: new Date("2026-05-11T16:00:00.000Z"),
            employeeId: "33333333-3333-4333-8333-333333333333",
          },
          {
            id: "bbbb2222-2222-4222-8222-bbbbbbbb2222",
            department: "ICU",
            position: "NURSE",
            startTime: new Date("2026-05-11T08:00:00.000Z"),
            endTime: new Date("2026-05-11T16:00:00.000Z"),
            employeeId: "44444444-4444-4444-8444-444444444444",
          },
        ],
      },
    },
  });

  await prisma.templateRule.createMany({
    data: [
      {
        id: "11111111-1111-4111-8111-111111111111",
        department: "ER",
        position: "DOCTOR",
        weekdays: ["MON", "TUE", "WED", "THU", "FRI"],
        startTimeLocal: "08:00",
        endTimeLocal: "16:00",
        slots: 1,
        active: true,
      },
      {
        id: "22222222-2222-4222-8222-222222222222",
        department: "ER",
        position: "NURSE",
        weekdays: ["MON", "TUE", "WED", "THU", "FRI"],
        startTimeLocal: "08:00",
        endTimeLocal: "16:00",
        slots: 2,
        active: true,
      },
      {
        id: "33333333-3333-4333-8333-333333333333",
        department: "ICU",
        position: "DOCTOR",
        weekdays: ["MON", "TUE", "WED", "THU", "FRI"],
        startTimeLocal: "08:00",
        endTimeLocal: "20:00",
        slots: 1,
        active: true,
      },
      {
        id: "44444444-4444-4444-8444-444444444444",
        department: "ICU",
        position: "NURSE",
        weekdays: ["MON", "TUE", "WED", "THU", "FRI"],
        startTimeLocal: "08:00",
        endTimeLocal: "20:00",
        slots: 3,
        active: true,
      },
      {
        id: "55555555-5555-4555-8555-555555555555",
        department: "SURGERY",
        position: "SURGEON",
        weekdays: ["MON", "TUE", "WED"],
        startTimeLocal: "07:00",
        endTimeLocal: "15:00",
        slots: 2,
        active: true,
      },
      {
        id: "66666666-6666-4666-8666-666666666666",
        department: "RADIOLOGY",
        position: "MEDICAL_ASSISTANT",
        weekdays: ["MON", "TUE", "WED", "THU", "FRI"],
        startTimeLocal: "09:00",
        endTimeLocal: "17:00",
        slots: 1,
        active: false,
      },
    ],
  });
  console.log("Seed completed");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
