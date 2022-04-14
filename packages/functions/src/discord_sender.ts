import * as firebase from 'firebase-admin';
import * as functions from 'firebase-functions';
import { getFirestore } from 'firebase-admin/firestore';
import { REST } from '@discordjs/rest';
import {
  RESTPostAPIChannelMessageResult,
  RESTPostAPICurrentUserCreateDMChannelResult,
  RESTPostAPIChannelMessageJSONBody,
  Routes,
} from 'discord-api-types/v9';

firebase.initializeApp();
const db = getFirestore();

interface MemberMessageRequest {
  memberId: string;
  content: string;
  createdAt: Date;
  sent?: boolean;
  needsRetry?: boolean;
  lastErrorMessage?: string;
}

interface Member {
  id: string;
  messageChannelId: string;
}

export const sendDirectMessageToMember = functions.firestore
  .document('memberMessageRequests/{requestId}')
  .onCreate(async (change) => {
    const data = change.data() as MemberMessageRequest;
    const member = await getOrCreateMember(data.memberId);

    try {
      await sendDirectMessage(member, data.content);
      await change.ref.set({ sent: true });
    } catch (e) {
      await change.ref.set({ lastErrorMessage: `${e}` });
    }
  });

const getOrCreateMember = async (memberId: string) => {
  const userRef = db.collection('members').doc(memberId);
  const existingMember = await userRef.get();
  if (existingMember.exists) {
    return existingMember.data() as Member;
  } else {
    const rest = createDiscordRestClient();
    const messsageChannel = (await rest.post(Routes.userChannels(), {
      body: {
        recipient_id: memberId,
      },
    })) as RESTPostAPICurrentUserCreateDMChannelResult;

    await userRef.set({
      id: memberId,
      messageChannelId: messsageChannel.id,
    });

    return (await (await userRef.get()).data()) as Member;
  }
};

export function createDiscordRestClient(
  accessToken: string = process.env.DISCORD_BOT_TOKEN as string
): REST {
  return new REST({ version: '9' }).setToken(accessToken);
}

async function sendDirectMessage(recipent: Member, content: string) {
  const rest = createDiscordRestClient();
  const body: RESTPostAPIChannelMessageJSONBody = {
    content,
  };
  return (await rest.post(Routes.channelMessages(recipent.messageChannelId), {
    body: body,
  })) as RESTPostAPIChannelMessageResult;
}
