import {
  circleRoleLabel,
  LocalDate,
  memberStatusLabel,
  monthCircleStateLabel,
  monthSurveyAnswerLabel,
} from "@circle-manager/shared/model";
import React from "react";
import { Link } from "react-router-dom";
import type { LoaderFunction } from "remix";
import { json, useLoaderData } from "remix";
import { adminOnly } from "~/auth/loader";
import { classNames } from "~/lib";
import { getJoinedMembers } from "~/model/member.server";

type LoaderData = {
  members: Awaited<ReturnType<typeof getLoaderData>>;
  year: number;
  month: number;
};

const getLoaderData = async () => {
  const firstDayOfNextMonth = LocalDate.firstDayOfNextMonth();
  return await getJoinedMembers({
    monthSurveyDate: firstDayOfNextMonth,
    monthCircleDate: firstDayOfNextMonth,
  });
};

export const loader: LoaderFunction = adminOnly(async () => {
  const firstDayOfNextMonth = LocalDate.firstDayOfNextMonth();
  return json<LoaderData>({
    members: await getLoaderData(),
    year: firstDayOfNextMonth.year(),
    month: firstDayOfNextMonth.monthValue(),
  });
});

export default function AdminMemberList() {
  const { members, year, month } = useLoaderData() as LoaderData;
  return (
    <>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold">メンバー一覧</h1>
          <p className="mt-2 text-sm">
            Discordに加入しているメンバーの一覧です
          </p>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-neutral-600">
                <thead className="bg-gray-50 dark:bg-neutral-800">
                  <tr>
                    <TableHeaderCell extraClassName="px-3 sm:pl-4">
                      名前
                    </TableHeaderCell>
                    <TableHeaderCell extraClassName="px-3">
                      サークル
                    </TableHeaderCell>
                    <TableHeaderCell extraClassName="px-3">
                      役職
                    </TableHeaderCell>
                    <TableHeaderCell extraClassName="px-3">
                      トレーナーID
                    </TableHeaderCell>
                    <TableHeaderCell extraClassName="px-3">
                      来月の在籍希望
                    </TableHeaderCell>
                    <TableHeaderCell extraClassName="px-3">
                      来月のサークル
                    </TableHeaderCell>
                    <TableHeaderCell extraClassName="relative pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Edit</span>
                    </TableHeaderCell>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-neutral-700 dark:bg-neutral-900">
                  {members.map((member, idx) => {
                    const answer = member.monthSurveyAnswer[0];
                    const monthCircle = member.monthCircles[0];
                    return (
                      <tr key={idx}>
                        <TableBodyCell extraClassName="pl-3 pr-3 sm:pl-4 font-medium">
                          {member.name}
                        </TableBodyCell>
                        <TableBodyCell extraClassName="px-3 ">
                          {member.circle?.name ??
                            memberStatusLabel(member.status)}
                        </TableBodyCell>
                        <TableBodyCell extraClassName="px-3 ">
                          {member.circle
                            ? circleRoleLabel(member.circleRole)
                            : ""}
                        </TableBodyCell>
                        <TableBodyCell extraClassName="px-3 ">
                          {member.trainerId}
                        </TableBodyCell>
                        <TableBodyCell extraClassName="px-3 ">
                          {answer?.value
                            ? monthSurveyAnswerLabel(answer.value)
                            : "対象外"}
                        </TableBodyCell>
                        <TableBodyCell extraClassName="px-3 ">
                          <Link
                            to={`/admin/members/${member.id}/month_circles/${year}/${month}`}
                            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                          >
                            {monthCircle?.state
                              ? monthCircleStateLabel(monthCircle.state)
                              : "未確定"}
                          </Link>
                        </TableBodyCell>
                        <TableBodyCell extraClassName="pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <Link
                            to={`/admin/members/${member.id}/`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <span className="sr-only">, {member.name}を</span>
                            編集
                          </Link>
                        </TableBodyCell>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const TableHeaderCell: React.FC<{
  extraClassName?: string;
  children: React.ReactNode;
}> = ({ extraClassName = "", children }) => {
  return (
    <th
      scope="col"
      className={classNames(
        extraClassName,
        "py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-neutral-100"
      )}
    >
      {children}
    </th>
  );
};

const TableBodyCell: React.FC<{
  extraClassName?: string;
  children: React.ReactNode;
}> = ({ extraClassName = "", children }) => {
  return (
    <td
      className={classNames(extraClassName, "whitespace-nowrap py-4 text-sm")}
    >
      {children}
    </td>
  );
};
