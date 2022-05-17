import type { ActionFunction, LoaderFunction } from "remix";
import { Form, useLoaderData, useTransition } from "remix";
import { adminOnly, adminOnlyAction } from "~/auth/loader";
import type { MouseEventHandler } from "react";
import React, { Fragment, useMemo, useRef, useState } from "react";
import { Dialog, Switch, Transition } from "@headlessui/react";
import { classNames } from "~/lib";
import CardWithDefaultPadding from "~/components/card_with_default_padding";
import type { getNotJoinedSignUps } from "~/model/signup.server";
import { useUser } from "~/utils";
import { ClipboardCopyIcon, ExclamationIcon } from "@heroicons/react/outline";
import CopyToClipboard from "react-copy-to-clipboard";
import { YearAndMonth } from "~/schema/date";
import type { Params } from "react-router";
import type { MonthCircle } from "~/model/month_circle.server";
import { getMonthCircles } from "~/model/month_circle.server";
import { monthCircleStateLabel } from "@/model";
import AdminHeader from "~/components/admin/header";
import AdminHeaderTitle from "~/components/admin/header/title";
import AdminHeaderActions from "~/components/admin/header/actions";
import AdminHeaderCircleSwitch from "~/components/admin/header/circle_switch";

type LoaderData = Awaited<ReturnType<typeof getLoaderData>>;
type SignUp = Awaited<ReturnType<typeof getNotJoinedSignUps>>[0];

const getLoaderData = async ({ params }: { params: Params<string> }) => {
  const { year, month } = YearAndMonth.parse(params);
  return {
    year,
    month,
    monthCircles: await getMonthCircles({ year, month }),
  };
};

export const loader: LoaderFunction = adminOnly(
  async ({ request, params }) => await getLoaderData({ params })
);

export const action: ActionFunction = adminOnlyAction(async ({ request }) => {
  return null;
});

function MonthCircleListItemHeader({
  monthCircle,
}: {
  monthCircle: MonthCircle;
}) {
  return (
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-medium text-gray-900">
        {monthCircle.member.name}
      </p>
      <p className="truncate text-sm text-gray-500">
        {monthCircle.member.circle?.name
          ? `${monthCircle.member.circle.name} → `
          : ""}
        {monthCircleStateLabel(monthCircle.state)}
      </p>
    </div>
  );
}

const MonthCircleListItemActions: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const transition = useTransition();
  return <div className="flex flex-row items-center space-x-2">{children}</div>;
};

export default function AdminMonthCircles() {
  const { year, month, monthCircles } = useLoaderData<LoaderData>();
  const user = useUser();
  const transition = useTransition();

  const [showOnlyMyCircle, setShowOnlyMyCircle] = useState(true);

  const {
    notKicked,
    notInvited,
    notJoined,
    notDiscordKicked,
    completed,
  }: typeof monthCircles = useMemo(() => {
    const filterBeforeKick = (m: MonthCircle) =>
      !showOnlyMyCircle || m.currentCircleKey == user.circleKey;
    const filterAfterKick = (m: MonthCircle) =>
      !showOnlyMyCircle || m.state == user.circleKey;
    const filterBoth = (m: MonthCircle) =>
      filterBeforeKick(m) || filterAfterKick(m);
    return {
      notKicked: monthCircles.notKicked.filter(filterBeforeKick),
      notInvited: monthCircles.notInvited.filter(filterAfterKick),
      notJoined: monthCircles.notJoined.filter(filterAfterKick),
      notDiscordKicked: monthCircles.notDiscordKicked.filter(filterBeforeKick),
      completed: monthCircles.completed.filter(filterBoth),
    };
  }, [monthCircles, showOnlyMyCircle]);

  return (
    <div>
      <AdminHeader>
        <AdminHeaderTitle title={`${year}年${month}月の移籍表`} />
        <AdminHeaderActions>
          <AdminHeaderCircleSwitch
            checked={showOnlyMyCircle}
            onChange={setShowOnlyMyCircle}
          />
        </AdminHeaderActions>
      </AdminHeader>
      <div className="grid grid-cols-1 gap-4 px-2 py-4 sm:gap-8 sm:px-4 md:px-6">
        <CardWithDefaultPadding
          header={
            <>
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                除名待ち
              </h3>
              <p className="mt-2 max-w-4xl text-sm text-gray-500">
                1日5時以降に除名してください。
              </p>
            </>
          }
        >
          {notKicked.length ? (
            <SignUpList
              children={notKicked.map((monthCircle) => (
                <li className="py-4">
                  <div className="flex items-center space-x-4">
                    <MonthCircleListItemHeader monthCircle={monthCircle} />
                    <MonthCircleListItemActions>
                      <button
                        disabled={transition.state == "submitting"}
                        className="inline-flex items-center rounded border border-transparent bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        // onClick={() => setOpen(true)}
                      >
                        除名済みにする
                      </button>
                    </MonthCircleListItemActions>
                    <Transition.Root show={false} as={Fragment}>
                      <Dialog
                        as="div"
                        className="fixed inset-0 z-10 overflow-y-auto"
                        // initialFocus={cancelButtonRef}
                        onClose={() => {
                          /*setOpen(false)*/
                        }}
                      >
                        <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                          <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                          >
                            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                          </Transition.Child>

                          {/* This element is to trick the browser into centering the modal contents. */}
                          <span
                            className="hidden sm:inline-block sm:h-screen sm:align-middle"
                            aria-hidden="true"
                          >
                            &#8203;
                          </span>
                          <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                          >
                            <div className="relative inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
                              <div className="sm:flex sm:items-start">
                                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                  <ExclamationIcon
                                    className="h-6 w-6 text-red-600"
                                    aria-hidden="true"
                                  />
                                </div>
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                  <Dialog.Title
                                    as="h3"
                                    className="text-lg font-medium leading-6 text-gray-900"
                                  >
                                    勧誘済みにします
                                  </Dialog.Title>
                                  <div className="mt-2 text-sm text-gray-500">
                                    <p>
                                      メンバーに勧誘した旨通知されるので、必ず勧誘を行ったことを確認してください。
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                <Form method="post">
                                  <input
                                    name="memberId"
                                    type="hidden"
                                    value={monthCircle.member.id}
                                  />
                                  <input
                                    name="invited"
                                    type="hidden"
                                    value="invited"
                                  />
                                  <button
                                    type="submit"
                                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                                    // onClick={() => setOpen(false)}
                                  >
                                    勧誘済みにする
                                  </button>
                                </Form>
                                <button
                                  type="button"
                                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                                  // onClick={() => setOpen(false)}
                                  // ref={cancelButtonRef}
                                >
                                  キャンセル
                                </button>
                              </div>
                            </div>
                          </Transition.Child>
                        </div>
                      </Dialog>
                    </Transition.Root>
                  </div>
                </li>
              ))}
            />
          ) : (
            <p>勧誘待ちはありません</p>
          )}
        </CardWithDefaultPadding>
        {/*<Card*/}
        {/*  header={*/}
        {/*    <>*/}
        {/*      <h3 className="text-lg font-medium leading-6 text-gray-900">*/}
        {/*        勧誘待ち*/}
        {/*      </h3>*/}
        {/*      <p className="mt-2 max-w-4xl text-sm text-gray-500">*/}
        {/*        サークルの「サークルメニュー」→「メンバー勧誘」→「勧誘」の画面でトレーナーIDを貼り付けて勧誘を行ってください。*/}
        {/*      </p>*/}
        {/*    </>*/}
        {/*  }*/}
        {/*>*/}
        {/*  {notInvitedSignUps.length ? (*/}
        {/*    <SignUpList*/}
        {/*      children={notInvitedSignUps.map((signUp) => (*/}
        {/*        <NotInvitedListItem key={signUp.id} signUp={signUp} />*/}
        {/*      ))}*/}
        {/*    />*/}
        {/*  ) : (*/}
        {/*    <p>勧誘待ちはありません</p>*/}
        {/*  )}*/}
        {/*</Card>*/}
        {/*<Card*/}
        {/*  header={*/}
        {/*    <>*/}
        {/*      <h3 className="text-lg font-medium leading-6 text-gray-900">*/}
        {/*        加入待ち*/}
        {/*      </h3>*/}
        {/*    </>*/}
        {/*  }*/}
        {/*>*/}
        {/*  /!*  {invitedSignUps.length ? (*!/*/}
        {/*  /!*    <SignUpList*!/*/}
        {/*  /!*      children={invitedSignUps.map((signUp) => (*!/*/}
        {/*  /!*        <InvitedListItem key={signUp.id} signUp={signUp} />*!/*/}
        {/*  /!*      ))}*!/*/}
        {/*  /!*    />*!/*/}
        {/*  /!*  ) : (*!/*/}
        {/*  /!*    <p>加入待ちはありません</p>*!/*/}
        {/*  /!*  )}*!/*/}
        {/*</Card>*/}
      </div>
    </div>
  );
}

const SignUpList: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flow-root">
      <ul role="list" className="-my-5 divide-y divide-gray-200">
        {children}
      </ul>
    </div>
  );
};

// const InvitedListItem: React.FC<{ signUp: MonthCircle }> = ({ signUp }) => {
//   const [open, setOpen] = useState(false);
//   const transition = useTransition();
//   const cancelButtonRef = useRef(null);
//   return (
//     <li className="py-4">
//       <div className="flex items-center space-x-4">
//         <div className="min-w-0 flex-1">
//           <p className="truncate text-sm font-medium text-gray-900">
//             {signUp.member.name}
//           </p>
//           <p className="truncate text-sm text-gray-500">
//             {signUp.circle?.name ?? "未選択"}
//           </p>
//         </div>
//         <div className="flex flex-row items-center space-x-2">
//           <Form method="post">
//             <input name="memberId" type="hidden" value={signUp.member.id} />
//             <button
//               disabled={transition.state == "submitting"}
//               className="inline-flex items-center rounded border border-transparent bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
//               onClick={() => setOpen(true)}
//             >
//               加入済みにする
//             </button>
//           </Form>
//         </div>
//         <Transition.Root show={open} as={Fragment}>
//           <Dialog
//             as="div"
//             className="fixed inset-0 z-10 overflow-y-auto"
//             initialFocus={cancelButtonRef}
//             onClose={() => setOpen(false)}
//           >
//             <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
//               <Transition.Child
//                 as={Fragment}
//                 enter="ease-out duration-300"
//                 enterFrom="opacity-0"
//                 enterTo="opacity-100"
//                 leave="ease-in duration-200"
//                 leaveFrom="opacity-100"
//                 leaveTo="opacity-0"
//               >
//                 <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
//               </Transition.Child>
//
//               {/* This element is to trick the browser into centering the modal contents. */}
//               <span
//                 className="hidden sm:inline-block sm:h-screen sm:align-middle"
//                 aria-hidden="true"
//               >
//                 &#8203;
//               </span>
//               <Transition.Child
//                 as={Fragment}
//                 enter="ease-out duration-300"
//                 enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
//                 enterTo="opacity-100 translate-y-0 sm:scale-100"
//                 leave="ease-in duration-200"
//                 leaveFrom="opacity-100 translate-y-0 sm:scale-100"
//                 leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
//               >
//                 <div className="relative inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
//                   <div className="sm:flex sm:items-start">
//                     <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
//                       <ExclamationIcon
//                         className="h-6 w-6 text-red-600"
//                         aria-hidden="true"
//                       />
//                     </div>
//                     <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
//                       <Dialog.Title
//                         as="h3"
//                         className="text-lg font-medium leading-6 text-gray-900"
//                       >
//                         加入済みにします
//                       </Dialog.Title>
//                       <div className="mt-2 text-sm text-gray-500">
//                         <p>
//                           加入済みにしてメンバーのロールを更新します、実行するとリストから消えますので必ず加入が済んだことを確認してください。
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
//                     <Form method="post">
//                       <input
//                         name="memberId"
//                         type="hidden"
//                         value={signUp.member.id}
//                       />
//                       <input name="joined" type="hidden" value="joined" />
//                       <button
//                         type="submit"
//                         className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
//                         onClick={() => setOpen(false)}
//                       >
//                         加入済みにする
//                       </button>
//                     </Form>
//                     <button
//                       type="button"
//                       className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
//                       onClick={() => setOpen(false)}
//                       ref={cancelButtonRef}
//                     >
//                       キャンセル
//                     </button>
//                   </div>
//                 </div>
//               </Transition.Child>
//             </div>
//           </Dialog>
//         </Transition.Root>
//       </div>
//     </li>
//   );
// };

const NotInvitedListItem: React.FC<{ signUp: SignUp }> = ({ signUp }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const transition = useTransition();
  const cancelButtonRef = useRef(null);
  return (
    <li className="py-4">
      <div className="flex items-center space-x-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900">
            {signUp.member.name}
          </p>
          <p className="truncate text-sm text-gray-500">
            {signUp.circle?.name ?? "未選択"}
          </p>
        </div>
        <div className="flex flex-row items-center space-x-2">
          {signUp.member.trainerId ? (
            <CopyToClipboard
              text={signUp.member.trainerId}
              onCopy={() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1000);
              }}
            >
              {copied ? (
                <p className="text-sm">コピーしました</p>
              ) : (
                <button
                  type="button"
                  className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-2.5 py-1.5 text-xs font-medium leading-4 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <ClipboardCopyIcon
                    className="-ml-0.5 mr-2 h-3.5 w-3.5"
                    aria-hidden="true"
                  />
                  トレーナーIDをコピー
                </button>
              )}
            </CopyToClipboard>
          ) : (
            <p className="text-sm text-gray-600">トレーナーID未入力</p>
          )}
          <Form method="post">
            <input name="memberId" type="hidden" value={signUp.member.id} />
            <button
              disabled={transition.state == "submitting"}
              className="inline-flex items-center rounded border border-transparent bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={() => setOpen(true)}
            >
              勧誘済みにする
            </button>
          </Form>
        </div>
        <Transition.Root show={open} as={Fragment}>
          <Dialog
            as="div"
            className="fixed inset-0 z-10 overflow-y-auto"
            initialFocus={cancelButtonRef}
            onClose={() => setOpen(false)}
          >
            <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
              </Transition.Child>

              {/* This element is to trick the browser into centering the modal contents. */}
              <span
                className="hidden sm:inline-block sm:h-screen sm:align-middle"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <div className="relative inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <ExclamationIcon
                        className="h-6 w-6 text-red-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900"
                      >
                        勧誘済みにします
                      </Dialog.Title>
                      <div className="mt-2 text-sm text-gray-500">
                        <p>
                          メンバーに勧誘した旨通知されるので、必ず勧誘を行ったことを確認してください。
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <Form method="post">
                      <input
                        name="memberId"
                        type="hidden"
                        value={signUp.member.id}
                      />
                      <input name="invited" type="hidden" value="invited" />
                      <button
                        type="submit"
                        className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={() => setOpen(false)}
                      >
                        勧誘済みにする
                      </button>
                    </Form>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                      onClick={() => setOpen(false)}
                      ref={cancelButtonRef}
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>
      </div>
    </li>
  );
};

interface AlertDialogProps {
  open: boolean;
  title: React.ReactNode;
  body: React.ReactNode;
  positiveButton: React.ReactNode;
  onClickPositiveButton: MouseEventHandler<HTMLButtonElement>;
  onClickNegativeButton: MouseEventHandler<HTMLButtonElement>;
  onClose: (value: boolean) => void;
}

export function AlertDialog({
  open,
  title,
  body,
  positiveButton,
  onClickPositiveButton,
  onClickNegativeButton,
  onClose,
}: AlertDialogProps) {
  const cancelButtonRef = useRef(null);
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        initialFocus={cancelButtonRef}
        onClose={onClose}
      >
        <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="hidden sm:inline-block sm:h-screen sm:align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="relative inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <ExclamationIcon
                    className="h-6 w-6 text-red-600"
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    {title}
                  </Dialog.Title>
                  <div className="mt-2 text-sm text-gray-500">{body}</div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={onClickPositiveButton}
                >
                  {positiveButton}
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={onClickNegativeButton}
                  ref={cancelButtonRef}
                >
                  キャンセル
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
