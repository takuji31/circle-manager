import {
  circleRoleLabel,
  LocalDate,
  memberStatusLabel,
  monthCircleStateLabel,
  monthSurveyAnswerLabel,
} from "@circle-manager/shared/model";
import React, { useState } from "react";
import type { LoaderFunction } from "remix";
import { json, useLoaderData } from "remix";
import { adminOnly } from "~/auth/loader";
import { getJoinedMembers } from "~/model/member.server";
import Link from "~/components/link";
import { CopyToClipboard } from "react-copy-to-clipboard";
import {
  ClipboardCheckIcon,
  ClipboardCopyIcon,
} from "@heroicons/react/outline";

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
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">メンバー一覧</h1>
          <p className="mt-2 text-sm text-gray-700">
            Discordに加入しているメンバーの一覧です
          </p>
        </div>
      </div>
      <div className="-mx-4 mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:-mx-6 md:mx-0 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
              >
                トレーナー名
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
              >
                サークル
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
              >
                役職
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                トレーナーID
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                来月の在籍希望
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                来月のサークル
              </th>
              {/*<th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">*/}
              {/*  <span className="sr-only">アクション</span>*/}
              {/*</th>*/}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {members.map((member) => {
              const answer = member.monthSurveyAnswer[0];
              const monthCircle = member.monthCircles[0];
              const circle =
                member.circle?.name ?? memberStatusLabel(member.status);
              const circleRole = member.circle
                ? circleRoleLabel(member.circleRole)
                : "";
              return (
                <tr key={member.id}>
                  <td className="w-full max-w-0 py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:w-auto sm:max-w-none sm:pl-6">
                    {member.name}
                    <dl className="font-normal lg:hidden">
                      <dt className="sr-only">サークル</dt>
                      <dd className="mt-1 truncate text-gray-700">{circle}</dd>
                      <dt className="sr-only sm:hidden">役職</dt>
                      <dd className="mt-1 truncate text-gray-500 sm:hidden">
                        {circleRole}
                      </dd>
                    </dl>
                  </td>
                  <td className="hidden px-3 py-4 text-sm text-gray-500 lg:table-cell">
                    {circle}
                  </td>
                  <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">
                    {circleRole}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    <span className="inline">
                      {member.trainerId}
                      {member.trainerId && (
                        <CopyTrainerIdButton trainerId={member.trainerId} />
                      )}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-sm font-medium">
                    {answer?.value
                      ? monthSurveyAnswerLabel(answer.value)
                      : "対象外"}
                  </td>
                  <td className="px-3 py-4 text-sm font-medium text-gray-500">
                    <Link
                      to={`/admin/members/${member.id}/month_circles/${year}/${month}`}
                    >
                      {monthCircle?.state
                        ? monthCircleStateLabel(monthCircle.state)
                        : "未確定"}
                    </Link>
                  </td>
                  {/*<td className="py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">*/}
                  {/*  <a*/}
                  {/*    href="#"*/}
                  {/*    className="text-indigo-600 hover:text-indigo-900"*/}
                  {/*  >*/}
                  {/*    Edit<span className="sr-only">, {member.name}</span>*/}
                  {/*  </a>*/}
                  {/*</td>*/}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const CopyTrainerIdButton: React.FC<{ trainerId: string }> = ({
  trainerId,
}) => {
  const [copied, setCopied] = useState(false);
  return (
    <CopyToClipboard
      text={trainerId}
      onCopy={() => {
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      }}
    >
      {copied ? (
        <ClipboardCheckIcon className="h-5 w-5" />
      ) : (
        <ClipboardCopyIcon className="h-5 w-5" />
      )}
    </CopyToClipboard>
  );
};
