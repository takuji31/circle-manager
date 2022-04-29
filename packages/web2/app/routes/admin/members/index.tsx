import {
  circleRoleLabel,
  LocalDate,
  memberStatusLabel,
} from "@circle-manager/shared/model";
import React from "react";
import { Link } from "react-router-dom";
import type { LoaderFunction } from "remix";
import { json, redirect, useLoaderData } from "remix";
import { authenticator } from "~/auth.server";
import { classNames } from "~/lib";
import { getJoinedMembers } from "~/model/member.server";

type LoaderData = {
  members: Awaited<ReturnType<typeof getLoaderData>>;
};

const getLoaderData = async () => {
  return await getJoinedMembers({
    monthSurveyDate: LocalDate.firstDayOfNextMonth(),
  });
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });
  if (!user.isAdmin) {
    redirect("/");
  }
  return json<LoaderData>({
    members: await getLoaderData(),
  });
};

export default function AdminMemberList() {
  const { members } = useLoaderData() as LoaderData;
  return (
    <div className="px-4 py-4 sm:px-6 lg:px-8">
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
                    <TableHeaderCell extraClassName="pl-4 pr-3 sm:pl-6">
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
                    <TableHeaderCell extraClassName="relative pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Edit</span>
                    </TableHeaderCell>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-neutral-700 dark:bg-neutral-900">
                  {members.map((member, idx) => (
                    <tr key={idx}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-black dark:text-white sm:pl-6">
                        {member.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-black dark:text-white">
                        {member.circle?.name ??
                          memberStatusLabel(member.status)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-black dark:text-white">
                        {member.circle
                          ? circleRoleLabel(member.circleRole)
                          : ""}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-black dark:text-white">
                        {member.trainerId}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link
                          to={`/admin/members/${member.id}/`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <span className="sr-only">, {member.name}を</span>編集
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
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
