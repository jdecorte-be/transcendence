import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const FAKE_USER_COUNT = 20;
const FAKE_PASSWORD = 'password123';

async function main() {
  const hash = await bcrypt.hash(FAKE_PASSWORD, 10);
  const usedUsernames = new Set<string>();

  for (let i = 0; i < FAKE_USER_COUNT; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    let username = faker.internet.userName({ firstName, lastName });
    while (usedUsernames.has(username)) {
      username = faker.internet.userName({ firstName, lastName });
    }
    usedUsernames.add(username);

    const avatarurl = `https://ui-avatars.com/api/?name=${firstName}-${lastName}&background=7940CF&color=fff`;

    await prisma.user.create({
      data: {
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        password: hash,
        firstName,
        lastName,
        Username: username,
        discreption: faker.lorem.sentence(),
        avatar: avatarurl,
        profileFinished: true,
        online: faker.datatype.boolean(),
      },
    });
  }

  console.log(`Seeded ${FAKE_USER_COUNT} fake users (password: "${FAKE_PASSWORD}")`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
