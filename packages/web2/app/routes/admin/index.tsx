import { nextMonthInt, thisMonthInt } from "@circle-manager/shared/model";
import React from "react";
import { useLoaderData } from "remix";
import { adminOnly } from "~/auth/loader";
import Card from "~/components/card";
import Link from "~/components/link";
import { prisma } from "~/db.server";

type LoaderData = Awaited<ReturnType<typeof getLoaderData>>;

const getLoaderData = async () => {
  const thisMonth = thisMonthInt();
  const nextMonth = nextMonthInt();
  return {
    thisMonth,
    nextMonth,
    signUps: await prisma.signUp.findMany({
      where: { joined: false, member: { leavedAt: null } },
      include: { member: true },
      orderBy: {
        createdAt: "asc",
      },
    }),
  };
};

export const loader = adminOnly(async () => {
  return await getLoaderData();
});

export default function AdminIndex() {
  const { thisMonth, nextMonth, signUps } = useLoaderData() as LoaderData;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <AdminSection title="加入申請">
        {signUps.map((signUp) => signUp.member.name)}
      </AdminSection>
      <AdminSection title="移籍表">
        <div className="flex flex-col space-y-2">
          <Link
            className="text-lg"
            to={`/admin/month_circles/${nextMonth.year}/${nextMonth.month}`}
          >
            {nextMonth.year}年{nextMonth.month}月
          </Link>
          <Link
            className="text-lg"
            to={`/admin/month_circles/${thisMonth.year}/${thisMonth.month}`}
          >
            {thisMonth.year}年{thisMonth.month}月
          </Link>
        </div>
      </AdminSection>
    </div>
  );
}

const AdminSection: React.FC<{
  title: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, children }) => {
  return (
    <div className="space-y-2">
      <Card
        header={
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            {title}
          </h3>
        }
      >
        {children}
      </Card>
    </div>
  );
};
