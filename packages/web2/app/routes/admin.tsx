import React, { Fragment } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { MenuAlt1Icon, XIcon } from "@heroicons/react/outline";
import { Form, LoaderFunction, Outlet, useLocation } from "remix";
import { useUser } from "~/utils";
import { adminOnly } from "~/auth/loader";

import { Circles } from "@circle-manager/shared/model";
import { classNames } from "~/lib";
import { ChevronDownIcon } from "@heroicons/react/solid";
import { Link } from "@remix-run/react";

interface NavItem {
  name: string;
  href: string;
  post?: boolean;
}

const navigation: Array<NavItem> = [
  { name: "トップ", href: "/" },
  { name: "メンバー一覧", href: "/admin/members" },
  {
    name: "サークル",
    href: "/admin/circles/@me",
  },
];
const userNavigation: Array<NavItem> = [
  { name: "ログアウト", href: "/auth/logout", post: true },
];

export const loader: LoaderFunction = adminOnly();

export default function Example() {
  const user = useUser();
  const location = useLocation();
  return (
    <div className="relative flex min-h-full flex-col">
      {/* Navbar */}
      <Disclosure as="nav" className="flex-shrink-0 bg-indigo-600">
        {({ open }) => (
          <>
            <div className="w-full px-2 sm:px-4 lg:px-8">
              <div className="relative flex h-16 items-center justify-between">
                {/* Logo section */}
                <div className="flex items-center px-2 lg:px-0 xl:w-64">
                  <div className="flex-shrink-0">
                    <h1 className="text-xl text-indigo-200">ウマ娘愛好会</h1>
                  </div>
                </div>

                {/* Search section */}
                {/* <div className="flex flex-1 justify-center lg:justify-end">
                  <div className="w-full px-2 lg:px-6">
                    <label htmlFor="search" className="sr-only">
                      Search projects
                    </label>
                    <div className="relative text-indigo-200 focus-within:text-gray-400">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <SearchIcon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <input
                        id="search"
                        name="search"
                        className="block w-full rounded-md border border-transparent bg-indigo-400 bg-opacity-25 py-2 pl-10 pr-3 leading-5 text-indigo-100 placeholder-indigo-200 focus:bg-white focus:text-gray-900 focus:placeholder-gray-400 focus:outline-none focus:ring-0 sm:text-sm"
                        placeholder="Search projects"
                        type="search"
                      />
                    </div>
                  </div>
                </div> */}
                <div className="flex lg:hidden">
                  {/* Mobile menu button */}
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-indigo-600 p-2 text-indigo-400 hover:bg-indigo-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XIcon
                        className="text-prima block h-6 w-6"
                        aria-hidden="true"
                      />
                    ) : (
                      <MenuAlt1Icon
                        className="block h-6 w-6"
                        aria-hidden="true"
                      />
                    )}
                  </Disclosure.Button>
                </div>
                {/* Links section */}
                <div className="hidden lg:block lg:w-auto">
                  <div className="flex items-center justify-end">
                    <div className="flex">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="rounded-md px-3 py-2 text-sm font-medium text-indigo-200 hover:text-white"
                          aria-current={
                            item.href == location.pathname ? "page" : undefined
                          }
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                    {/* Profile dropdown */}
                    <Menu as="div" className="relative ml-4 flex-shrink-0">
                      <div>
                        <Menu.Button className="flex rounded-full bg-indigo-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-700">
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
                        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          {userNavigation.map((item) => (
                            <Menu.Item key={item.name}>
                              {({ active }) =>
                                item.post ? (
                                  <Form action={item.href} method="post">
                                    <button
                                      type="submit"
                                      className={classNames(
                                        active ? "bg-gray-100" : "",
                                        "block w-full px-4 py-2 text-left text-sm text-gray-700"
                                      )}
                                    >
                                      {item.name}
                                    </button>
                                  </Form>
                                ) : (
                                  <Link
                                    to={item.href}
                                    className={classNames(
                                      active ? "bg-gray-100" : "",
                                      "block w-full px-4 py-2 text-sm text-gray-700"
                                    )}
                                  >
                                    {item.name}
                                  </Link>
                                )
                              }
                            </Menu.Item>
                          ))}
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="lg:hidden">
              <div className="space-y-1 px-2 pt-2 pb-3">
                {navigation.map((item) => (
                  <Disclosure.Button
                    key={item.name}
                    as="a"
                    href={item.href}
                    className={classNames(
                      item.href == location.pathname
                        ? "bg-indigo-800 text-white"
                        : "text-indigo-200 hover:bg-indigo-600 hover:text-indigo-100",
                      "block rounded-md px-3 py-2 text-base font-medium"
                    )}
                    aria-current={
                      item.href == location.pathname ? "page" : undefined
                    }
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
              </div>
              <div className="border-t border-indigo-800 pt-4 pb-3">
                <div className="space-y-1 px-2">
                  {userNavigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as="a"
                      href={item.href}
                      className="block rounded-md px-3 py-2 text-base font-medium text-indigo-200 hover:bg-indigo-600 hover:text-indigo-100"
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}
                </div>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      <div className="px-4 py-4">
        <Outlet />
      </div>
    </div>
  );
}
