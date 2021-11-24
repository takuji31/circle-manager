export interface Circle {
  id: string;
  name: string;
}

export const Circles = {
  maxMembers: 30,
  specialIds: {
    noAnswer: '9999999999999999999',
    leave: '7777777777777777777',
    ob: '889835308189900810',
    kick: '8888888888888888888',
    notJoined: '902440950176034816',
  },
};

const specialName: { [key: string]: string } = {
  '889835308189900810': '脱退(Discord残留)',
};

export const getCircleName = (circle: { id: string; name: string }) => {
  return specialName[circle.id] ?? circle.name;
};

export const isLeaveCircle = (circle: { id: string }) => {
  return (
    circle.id == Circles.specialIds.leave || circle.id == Circles.specialIds.ob
  );
};

export const shouldLeaveGuild = (circle: { id: string }) => {
  return (
    circle.id == Circles.specialIds.leave ||
    circle.id == Circles.specialIds.kick
  );
};
