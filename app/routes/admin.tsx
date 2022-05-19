import React, { Fragment, useMemo, useState } from "react";
import { Dialog, Menu, Transition } from "@headlessui/react";
import type { LinksFunction } from "@remix-run/node";
import { Form, Outlet, useLoaderData, useLocation } from "@remix-run/react";
import { useUser } from "~/utils";
import { adminOnly } from "~/auth/loader";

import { Circles, nextMonthInt, thisMonthInt } from "@/model";
import { classNames } from "~/lib";
import { Link } from "@remix-run/react";
import {
  HomeIcon,
  MenuIcon,
  UserAddIcon,
  UsersIcon,
  XIcon,
} from "@heroicons/react/outline";
import { SearchIcon, SelectorIcon } from "@heroicons/react/solid";
import { DashboardLayout } from "~/mui/components/admin/dashboard-layout";
import simpleBarStylesheetUrl from "simplebar-react/dist/simplebar.min.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: simpleBarStylesheetUrl }];
};

interface NavItem {
  name: string;
  href: string;
  post?: boolean;
  icon: (props: React.ComponentProps<"svg">) => JSX.Element;
}

const navigation: Array<NavItem> = [
  { name: "ホーム", href: "/admin/", icon: HomeIcon },
  { name: "メンバー一覧", href: "/admin/members", icon: UsersIcon },
  { name: "加入申請", href: "/admin/signups", icon: UserAddIcon },
];
const userNavigation: Array<Omit<NavItem, "icon">> = [
  { name: "ログアウト", href: "/auth/logout", post: true },
];

type LoaderData = Awaited<ReturnType<typeof getLoaderData>>;

const getLoaderData = async () => {
  const thisMonth = thisMonthInt();
  const nextMonth = nextMonthInt();
  return {
    thisMonth,
    nextMonth,
  };
};

export const loader = adminOnly(async () => {
  return await getLoaderData();
});

export default function AdminIndex() {
  const { thisMonth, nextMonth } = useLoaderData<LoaderData>();
  const months = [thisMonth, nextMonth];
  const user = useUser();
  const location = useLocation();
  const circle = useMemo(
    () => (user.circleKey ? Circles.findByCircleKey(user.circleKey) : null),
    [user.circleKey]
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    </>
  );
}

const Hoge = () => {
  const { thisMonth, nextMonth } = useLoaderData<LoaderData>();
  const months = [thisMonth, nextMonth];
  const user = useUser();
  const location = useLocation();
  const circle = useMemo(
    () => (user.circleKey ? Circles.findByCircleKey(user.circleKey) : null),
    [user.circleKey]
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-full">
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-40 flex lg:hidden"
          onClose={setSidebarOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white pt-5 pb-4">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    type="button"
                    className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
              <div className="flex flex-shrink-0 items-center px-4">
                <h1 className="text-2xl">ウマ娘愛好会</h1>
              </div>
              <div className="mt-5 h-0 flex-1 overflow-y-auto">
                <nav className="px-2">
                  <div className="space-y-1">
                    {navigation.map((item) => {
                      const current = item.href == location.pathname;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={classNames(
                            current
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                            "group flex items-center rounded-md px-2 py-2 text-base font-medium leading-5"
                          )}
                          aria-current={current ? "page" : undefined}
                        >
                          <item.icon
                            className={classNames(
                              current
                                ? "text-gray-500"
                                : "text-gray-400 group-hover:text-gray-500",
                              "mr-3 h-6 w-6 flex-shrink-0"
                            )}
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                  <div className="mt-8">
                    <h3
                      className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500"
                      id="mobile-teams-headline"
                    >
                      サークル
                    </h3>
                    <div
                      className="mt-1 space-y-1"
                      role="group"
                      aria-labelledby="mobile-teams-headline"
                    >
                      {Circles.activeCircles.map((circle) => (
                        <Link
                          key={circle.name}
                          to={`/admin/circles/${circle.key}`}
                          className="group flex items-center rounded-md px-3 py-2 text-base font-medium leading-5 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        >
                          <span className="truncate">{circle.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="mt-8">
                    <h3
                      className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500"
                      id="mobile-teams-headline"
                    >
                      移籍表
                    </h3>
                    <div
                      className="mt-1 space-y-1"
                      role="group"
                      aria-labelledby="mobile-teams-headline"
                    >
                      {months.map((month) => (
                        <Link
                          key={`${month.year}-${month.month}`}
                          to={`/admin/month_circles/${month.year}/${month.month}`}
                          className="group flex items-center rounded-md px-3 py-2 text-base font-medium leading-5 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        >
                          <span className="truncate">
                            {month.year}年{month.month}月
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </nav>
              </div>
            </div>
          </Transition.Child>
          <div className="w-14 flex-shrink-0" aria-hidden="true">
            {/* Dummy element to force sidebar to shrink to fit close icon */}
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-gray-100 lg:pt-5 lg:pb-4">
        <div className="flex flex-shrink-0 items-center px-6">
          <h1 className="text-2xl">ウマ娘愛好会</h1>
        </div>
        {/* Sidebar component, swap this element with another sidebar if you like */}
        <div className="mt-6 flex h-0 flex-1 flex-col overflow-y-auto">
          {/* User account dropdown */}
          <Menu as="div" className="relative inline-block px-3 py-1 text-left">
            <div>
              <Menu.Button className="group w-full rounded-md bg-gray-100 px-3.5 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-100">
                <span className="flex w-full items-center justify-between">
                  <span className="flex min-w-0 items-center justify-between space-x-3">
                    <img
                      className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-300"
                      src={user.profileImageUrl ?? ""}
                      alt=""
                    />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium text-gray-900">
                        {user.name}
                      </span>
                      <span className="truncate text-sm text-gray-500">
                        {circle && circle.name}
                      </span>
                    </span>
                  </span>
                  <SelectorIcon
                    className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                </span>
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
              <Menu.Items className="absolute right-0 left-0 z-10 mx-3 mt-1 origin-top divide-y divide-gray-200 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <Form method="post" action="/auth/logout">
                        <button
                          className={classNames(
                            active
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-700",
                            "block w-full px-4 py-2 text-left text-sm"
                          )}
                        >
                          ログアウト
                        </button>
                      </Form>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
          {/* Sidebar Search */}
          <div className="mt-5 px-3">
            <label htmlFor="search" className="sr-only">
              Search
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div
                className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
                aria-hidden="true"
              >
                <SearchIcon
                  className="mr-3 h-4 w-4 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="block w-full rounded-md border-gray-300 pl-9 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Search"
              />
            </div>
          </div>
          {/* Navigation */}
          <nav className="mt-6 px-3">
            <div className="space-y-1">
              {navigation.map((item) => {
                const current = item.href == location.pathname;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={classNames(
                      current
                        ? "bg-gray-200 text-gray-900"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                      "group flex items-center rounded-md px-2 py-2 text-sm font-medium"
                    )}
                    aria-current={current ? "page" : undefined}
                  >
                    <item.icon
                      className={classNames(
                        current
                          ? "text-gray-500"
                          : "text-gray-400 group-hover:text-gray-500",
                        "mr-3 h-6 w-6 flex-shrink-0"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </div>
            <div className="mt-8">
              {/* Secondary navigation */}
              <h3
                className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500"
                id="desktop-teams-headline"
              >
                サークル
              </h3>
              <div
                className="mt-1 space-y-1"
                role="group"
                aria-labelledby="desktop-teams-headline"
              >
                {Circles.activeCircles.map((circle) => (
                  <Link
                    key={circle.name}
                    to={`/admin/circles/${circle.key}`}
                    className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <span className="truncate">{circle.name}</span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-8">
              {/* Secondary navigation */}
              <h3
                className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500"
                id="desktop-teams-headline"
              >
                移籍表
              </h3>
              <div
                className="mt-1 space-y-1"
                role="group"
                aria-labelledby="desktop-teams-headline"
              >
                {months.map((month) => (
                  <Link
                    key={`${month.year}-${month.month}`}
                    to={`/admin/month_circles/${month.year}/${month.month}`}
                    className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <span className="truncate">
                      {month.year}年{month.month}月
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        </div>
      </div>
      {/* Main column */}
      <div className="flex flex-col lg:pl-64">
        {/* Search header */}
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 border-b border-gray-200 bg-white lg:hidden">
          <button
            type="button"
            className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <MenuIcon className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex flex-1">
              <form className="flex w-full md:ml-0" action="#" method="GET">
                <label htmlFor="search-field" className="sr-only">
                  Search
                </label>
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
                    <SearchIcon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <input
                    id="search-field"
                    name="search-field"
                    className="block h-full w-full border-transparent py-2 pl-8 pr-3 text-gray-900 placeholder-gray-500 focus:border-transparent focus:placeholder-gray-400 focus:outline-none focus:ring-0 sm:text-sm"
                    placeholder="Search"
                    type="search"
                  />
                </div>
              </form>
            </div>
            <div className="flex items-center">
              {/* Profile dropdown */}
              <Menu as="div" className="relative ml-3">
                <div>
                  <Menu.Button className="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                    <span className="sr-only">Open user menu</span>
                    <img
                      className="h-8 w-8 rounded-full"
                      src={user.profileImageUrl ?? ""}
                      alt=""
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
                  <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-gray-200 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <Form method="post" action="/auth/logout">
                            <button
                              className={classNames(
                                active
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-gray-700",
                                "block w-full px-4 py-2 text-left text-sm"
                              )}
                            >
                              ログアウト
                            </button>
                          </Form>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
