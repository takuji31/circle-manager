import AdminHeader from "~/components/admin/header";
import AdminHeaderTitle from "~/components/admin/header/title";
import React from "react";
import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "remix";
import type { Params } from "react-router";
import { z } from "zod";
import { ActiveCircleKey } from "~/schema/member";
import { notFound } from "~/response.server";
import { Circles } from "@circle-manager/shared/model";
import Link from "~/components/link";
import { LocalDate } from "@circle-manager/shared/model";

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
  const yesterday = LocalDate.yesterday();
  return {
    circle: Circles.findByCircleKey(circleKey),
    yesterday: {
      year: yesterday.year(),
      month: yesterday.monthValue(),
      day: yesterday.dayOfMonth(),
    },
  };
};

export const loader: LoaderFunction = async ({ params }) => {
  return await getLoaderData(params);
};

export default function AdminCirclesCircleKey() {
  const { circle, yesterday } = useLoaderData<LoaderData>();
  return (
    <div>
      <AdminHeader>
        <AdminHeaderTitle title={circle.name} />
      </AdminHeader>
      <div className="mx-4 sm:mx-6 lg:mx-8">
        <Link
          to={`/circles/${circle.key}/fans/${yesterday.year}/${yesterday.month}/${yesterday.day}`}
        >
          昨日のファン数
        </Link>
      </div>
    </div>
  );
}
