import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const FAKE_USER_COUNT = 20;
const FAKE_MATCH_COUNT = 150;
const FAKE_PASSWORD = 'password123';

// Reimplementation of the "beam" avatar from boring-avatars
// (https://github.com/boringdesigners/boring-avatars, MIT), done from
// scratch here since the package is React-only and its hosted API
// (source.boringavatars.com) has an expired TLS cert.
const BEAM_SIZE = 36;
const BEAM_COLORS = ['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90'];

const hashCode = (name: string): number => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
};

const getDigit = (num: number, ntn: number): number =>
  Math.floor((num / Math.pow(10, ntn)) % 10);

const getBoolean = (num: number, ntn: number): boolean =>
  !(getDigit(num, ntn) % 2);

const getUnit = (num: number, range: number, index?: number): number => {
  const value = num % range;
  return index && getDigit(num, index) % 2 === 0 ? -value : value;
};

const getRandomColor = (num: number, colors: string[], range: number): string =>
  colors[num % range];

const getContrast = (hexColor: string): string => {
  const hex = hexColor.startsWith('#') ? hexColor.slice(1) : hexColor;
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#000000' : '#FFFFFF';
};

const generateBoringAvatar = (seedName: string, size = 128): string => {
  const range = BEAM_COLORS.length;
  const numFromName = hashCode(seedName);
  const wrapperColor = getRandomColor(numFromName, BEAM_COLORS, range);

  const preTranslateX = getUnit(numFromName, 10, 1);
  const wrapperTranslateX =
    preTranslateX < 5 ? preTranslateX + BEAM_SIZE / 9 : preTranslateX;
  const preTranslateY = getUnit(numFromName, 10, 2);
  const wrapperTranslateY =
    preTranslateY < 5 ? preTranslateY + BEAM_SIZE / 9 : preTranslateY;

  const wrapperRotate = getUnit(numFromName, 360);
  const wrapperScale = 1 + getUnit(numFromName, BEAM_SIZE / 12) / 10;
  const isMouthOpen = getBoolean(numFromName, 2);
  const isCircle = getBoolean(numFromName, 1);
  const eyeSpread = getUnit(numFromName, 5);
  const mouthSpread = getUnit(numFromName, 3);
  const faceRotate = getUnit(numFromName, 10, 3);
  const faceTranslateX =
    wrapperTranslateX > BEAM_SIZE / 6
      ? wrapperTranslateX / 2
      : getUnit(numFromName, 8, 1);
  const faceTranslateY =
    wrapperTranslateY > BEAM_SIZE / 6
      ? wrapperTranslateY / 2
      : getUnit(numFromName, 7, 2);

  const faceColor = getContrast(wrapperColor);
  const backgroundColor = getRandomColor(numFromName + 13, BEAM_COLORS, range);

  const mouth = isMouthOpen
    ? `<path d="M15 ${19 + mouthSpread}c2 1 4 1 6 0" stroke="${faceColor}" fill="none" stroke-linecap="round" />`
    : `<path d="M13,${19 + mouthSpread} a1,0.75 0 0,0 10,0" fill="${faceColor}" />`;

  const svg = `<svg viewBox="0 0 ${BEAM_SIZE} ${BEAM_SIZE}" fill="none" role="img" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="${BEAM_SIZE}" height="${BEAM_SIZE}"><rect width="${BEAM_SIZE}" height="${BEAM_SIZE}" rx="${BEAM_SIZE * 2}" fill="#FFFFFF" /></mask><g mask="url(#m)"><rect width="${BEAM_SIZE}" height="${BEAM_SIZE}" fill="${backgroundColor}" /><rect x="0" y="0" width="${BEAM_SIZE}" height="${BEAM_SIZE}" transform="translate(${wrapperTranslateX} ${wrapperTranslateY}) rotate(${wrapperRotate} ${BEAM_SIZE / 2} ${BEAM_SIZE / 2}) scale(${wrapperScale})" fill="${wrapperColor}" rx="${isCircle ? BEAM_SIZE : BEAM_SIZE / 6}" /><g transform="translate(${faceTranslateX} ${faceTranslateY}) rotate(${faceRotate} ${BEAM_SIZE / 2} ${BEAM_SIZE / 2})">${mouth}<rect x="${14 - eyeSpread}" y="14" width="1.5" height="2" rx="1" stroke="none" fill="${faceColor}" /><rect x="${20 + eyeSpread}" y="14" width="1.5" height="2" rx="1" stroke="none" fill="${faceColor}" /></g></g></svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
};

async function main() {
  const hash = await bcrypt.hash(FAKE_PASSWORD, 10);
  const usedUsernames = new Set<string>();
  const userIds: string[] = [];

  for (let i = 0; i < FAKE_USER_COUNT; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    let username = faker.internet.userName({ firstName, lastName });
    while (usedUsernames.has(username)) {
      username = faker.internet.userName({ firstName, lastName });
    }
    usedUsernames.add(username);

    const avatarurl = generateBoringAvatar(username);

    const user = await prisma.user.create({
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
    userIds.push(user.userId);
  }

  console.log(`Seeded ${FAKE_USER_COUNT} fake users (password: "${FAKE_PASSWORD}")`);

  for (let i = 0; i < FAKE_MATCH_COUNT; i++) {
    const [participant1Id, participant2Id] = faker.helpers.arrayElements(
      userIds,
      2,
    );
    const winnerScore = faker.number.int({ min: 5, max: 11 });
    const loserScore = faker.number.int({ min: 0, max: winnerScore - 1 });
    const participant1Wins = faker.datatype.boolean();

    await prisma.match.create({
      data: {
        participant1Id,
        participant2Id,
        winner_id: participant1Wins ? participant1Id : participant2Id,
        score1: participant1Wins ? winnerScore : loserScore,
        score2: participant1Wins ? loserScore : winnerScore,
        createdAt: faker.date.recent({ days: 60 }),
      },
    });
  }

  console.log(`Seeded ${FAKE_MATCH_COUNT} fake matches`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
