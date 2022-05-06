import AdminHeader from "~/components/admin/header";
import AdminHeaderTitle from "~/components/admin/header/title";
import React from "react";
import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "remix";
import type { Params } from "react-router";
import { z } from "zod";
import { ActiveCircleKey } from "~/schema/member";
import { notFound } from "~/response.server";
import { Circles, LocalDate, Period } from "@circle-manager/shared/model";
import Link from "~/components/link";
import { getDatesFrom } from "~/model/date.server";
import { AdminBody } from "~/components/admin/body";

type LoaderData = Awaited<ReturnType<typeof getLoaderData>>;

const paramsSchema = z.object({
  circleKey: ActiveCircleKey,
});

export const getLoaderData = async (params: Params<string>) => {
  const result = paramsSchema.safeParse(params);
  if (!result.success) {
    throw notFound();
  }
  const { circleKey } = result.data;
  return {
    circle: Circles.findByCircleKey(circleKey),
    dates: getDatesFrom({
      start: LocalDate.today(),
      period: Period.ofDays(-30),
    }),
  };
};

export const loader: LoaderFunction = async ({ params }) => {
  return await getLoaderData(params);
};

export default function AdminCirclesCircleKey() {
  const { circle, dates } = useLoaderData<LoaderData>();
  return (
    <div>
      <AdminHeader>
        <AdminHeaderTitle title={circle.name} />
      </AdminHeader>
      <AdminBody>
        <div className="border-b border-gray-200 pb-5">
          <h2 className="text-lg font-medium leading-6 text-gray-900">
            ファン数記録・確認
          </h2>
        </div>
        <ul
          role="list"
          className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6"
        >
          {dates.map((date) => (
            <li
              key={`${date.year}${date.month}${date.day}`}
              className="col-span-1 flex rounded-md shadow-sm"
            >
              <div className="flex flex-1 items-center justify-between truncate rounded-md border border-gray-200 bg-white">
                <Link
                  to={`/admin/circles/${circle.key}/fans/${date.year}/${date.month}/${date.day}`}
                  className="group flex-1 truncate px-4 py-4 text-sm"
                >
                  <span className="font-medium text-gray-900 group-hover:text-gray-600">
                    {`${date.year}/${date.month}/${date.day}`}
                  </span>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </AdminBody>
    </div>
  );
}
