import {
  circleRoleLabel,
  LocalDate,
  memberStatusLabel,
  monthCircleStateLabel,
  monthSurveyAnswerLabel,
} from "@circle-manager/shared/model";
import React, { Fragment, useState } from "react";
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
import { Menu, Transition } from "@headlessui/react";
import { classNames } from "~/lib";
import {
  ChatAltIcon,
  CodeIcon,
  DotsVerticalIcon,
  EyeIcon,
  FlagIcon,
  PlusSmIcon,
  SearchIcon,
  ShareIcon,
  StarIcon,
  ThumbUpIcon,
} from "@heroicons/react/solid";
import {
  BellIcon,
  FireIcon,
  HomeIcon,
  MenuIcon,
  TrendingUpIcon,
  UserGroupIcon,
  XIcon,
} from "@heroicons/react/outline";
import AdminHeader from "~/components/admin/header";
import AdminHeaderTitle from "~/components/admin/header/title";

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
    <div>
      <AdminHeader>
        <AdminHeaderTitle title="メンバー一覧" />
      </AdminHeader>

      <div className="px-4 sm:px-6 lg:px-8">
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
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">アクション</span>
                </th>
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
                        <dd className="mt-1 truncate text-gray-700">
                          {circle}
                        </dd>
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
                    <td className="py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <Menu
                        as="div"
                        className="relative inline-block text-left"
                      >
                        <div>
                          <Menu.Button className="-m-2 flex items-center rounded-full p-2 text-gray-400 hover:text-gray-600">
                            <span className="sr-only">Open options</span>
                            <DotsVerticalIcon
                              className="h-5 w-5"
                              aria-hidden="true"
                            />
                          </Menu.Button>
                        </div>

                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="py-1">
                              <Menu.Item>
                                {({ active }) => (
                                  <Link
                                    to={`/members/pathname/${member.pathname}/setup`}
                                    className={classNames(
                                      active
                                        ? "bg-gray-100 text-gray-900"
                                        : "text-gray-700",
                                      "flex px-4 py-2 text-sm"
                                    )}
                                  >
                                    <span>加入申請URLを開く</span>
                                  </Link>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }) => (
                                  <Link
                                    to={`/members/pathname/${member.pathname}/edit`}
                                    className={classNames(
                                      active
                                        ? "bg-gray-100 text-gray-900"
                                        : "text-gray-700",
                                      "flex px-4 py-2 text-sm"
                                    )}
                                  >
                                    <span>トレーナーID登録URLを開く</span>
                                  </Link>
                                )}
                              </Menu.Item>
                            </div>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
