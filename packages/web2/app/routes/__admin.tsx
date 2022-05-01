import { Form, Outlet, useLocation } from "@remix-run/react";
import { Link } from "@remix-run/react";
import { Fragment } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { MenuIcon, XIcon } from "@heroicons/react/outline";

import { Circles } from "@circle-manager/shared/model";
import React from "react";
import { useOptionalUser } from "~/utils";

import { ChevronDownIcon } from "@heroicons/react/solid";
import { classNames } from "~/lib";

export default function AdminLayout() {
  return (
    <div className="min-h-full  bg-slate-50 text-black dark:bg-neutral-900 dark:text-white">
      <Navigation />
      <div className="px-2 py-2 sm:py-4 sm:px-4">
        <Outlet />
      </div>
    </div>
  );
}

interface NavItem {
  name: string;
  href: string;
}

interface NestedNavItem {
  name: string;
  children: Array<NavItem>;
}

const adminNavigations: Array<NavItem | NestedNavItem> = [
  { name: "トップ", href: "/" },
  { name: "メンバー一覧", href: "/admin/members" },
  {
    name: "サークル",
    children: Circles.activeCircles.map((circle) => ({
      name: circle.name,
      href: `/circles/${circle.key}`,
    })),
  },
];

function isNestedNavItem(
  navItem: NavItem | NestedNavItem
): navItem is NestedNavItem {
  return Object.keys(navItem).includes("children");
}

const Navigation: React.FC = () => {
  const user = useOptionalUser();
  const location = useLocation();
  return (
    <Disclosure
      as="nav"
      className="sticky top-0 w-full bg-blue-600 text-white shadow-md dark:bg-neutral-800 dark:shadow-none"
    >
      {({ open }) => (
        <>
          <div className="w-full px-2 sm:px-4">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2  hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <span className="text-lg">
                    <Link to="/">ウマ娘愛好会</Link>
                  </span>
                </div>
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">
                    {user &&
                      user.isAdmin &&
                      adminNavigations.map((item, idx) => {
                        if (isNestedNavItem(item)) {
                          return (
                            <NestedNavItemLink
                              key={idx}
                              item={item}
                              pathname={location.pathname}
                            />
                          );
                        } else {
                          return (
                            <NavItemLink
                              key={idx}
                              item={item}
                              pathname={location.pathname}
                            />
                          );
                        }
                      })}
                  </div>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                {!user && (
                  <Form
                    action="/api/auth/discord"
                    method="post"
                    className="block rounded-md px-2 py-2 hover:bg-blue-700 dark:hover:bg-neutral-700"
                  >
                    <button>ログイン</button>
                  </Form>
                )}
                {/* Profile dropdown */}
                {user && (
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                        <span className="sr-only">Open user menu</span>
                        <img
                          className="h-8 w-8 rounded-full"
                          src={user.profileImageUrl ?? ""}
                          alt={user.name}
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
                      <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-neutral-700">
                        <Menu.Item>
                          {({ active }) => (
                            <Form
                              action="/auth/logout"
                              method="post"
                              className={classNames(
                                active ? "bg-gray-100 dark:bg-neutral-600" : "",
                                "block w-full text-sm text-neutral-900 dark:text-neutral-100"
                              )}
                            >
                              <button className="block h-full w-full px-4 py-2  text-left">
                                ログアウト
                              </button>
                            </Form>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                )}
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pt-2 pb-3">
              {/* {adminNavigations.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  to={item.href}
                  className={classNames(
                    item.current
                      ? "bg-gray-900 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white",
                    "block rounded-md px-3 py-2 text-base font-medium"
                  )}
                  aria-current={item.current ? "page" : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))} */}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

const NavItemLink: React.FC<{ item: NavItem; pathname: string }> = ({
  item,
  pathname,
}) => {
  return (
    <a
      key={item.name}
      href={item.href}
      className={classNames(
        item.href == pathname ? "bg-blue-700 dark:bg-neutral-700" : "",
        "rounded-md bg-blue-600 px-3 py-2 text-sm font-medium dark:bg-neutral-800"
      )}
      aria-current={item.href ? "page" : undefined}
    >
      {item.name}
    </a>
  );
};

const NestedNavItemLink: React.FC<{
  item: NestedNavItem;
  pathname: string;
}> = ({ item, pathname }) => {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex w-full justify-center rounded-md py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
          {item.name}
          <ChevronDownIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
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
        <Menu.Items className="absolute left-0 mt-2 w-56 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-neutral-700">
          {item.children.map((child, idx) => {
            return (
              <div key={idx}>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to={child.href}
                      className={classNames(
                        active ? "bg-gray-100 dark:bg-gray-600" : "",
                        "group flex w-full items-center rounded-md px-4 py-2 text-base  text-black dark:text-white"
                      )}
                    >
                      {child.name}
                    </Link>
                  )}
                </Menu.Item>
              </div>
            );
          })}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
