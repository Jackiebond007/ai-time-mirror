"use client";

import { createClient } from "@/lib/supabase/client";
import useSWRImmutable from "swr/immutable";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/types";
import { useTransition } from "react";
import { checkout } from "@/app/actions/checkout";
import { LoadingDots } from "@/components/shared/icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CircleCheck } from "lucide-react";
import { BackgroundGradient } from "@/components/aceternity-ui/background-gradient";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useUserDataStore } from "@/components/layout/navbar";
import { useSignInDialog } from "@/components/layout/sign-in-dialog";

export function Pricing() {
  const supabase = createClient();

  const { data: products } = useSWRImmutable("get_products", async () => {
    const get_products = "get_products";
    const { data: products, error } = await supabase.rpc(get_products);
    return products;
  });

  const sortedProducts = products?.sort((a: any, b: any) => a.price - b.price);

  if (!sortedProducts || sortedProducts.length === 0) {
    return null;
  }

  return (
    <section id="pricing" className="mt-6 w-full md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="bg-gradient-to-br from-black to-stone-500 bg-clip-text text-center font-default text-4xl font-bold tracking-[-0.02em] text-transparent drop-shadow-sm md:text-5xl md:leading-[5rem]">
              Simple & Transparent Pricing
            </h2>
            <p className="max-w-[900px] pb-8 text-gray-700 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Choose the plan that best fits your needs and start experiencing now
            </p>
          </div>
        </div>
        <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
          {sortedProducts.map((product, index) => {
            const isPopular = index === 1;

            return (
              <div
                key={product.price_id}
                className={cn("flex", isPopular ? "md:-mt-8" : "")}
              >
                {isPopular ? (
                  <BackgroundGradient
                    containerClassName={cn(
                      "rounded-lg bg-card text-card-foreground shadow-sm",
                      "rounded-2xl w-full",
                      "p-[2.5px]",
                    )}
                    className={cn(
                      "flex h-full flex-col rounded-[14px] bg-background",
                    )}
                  >
                    <div className="flex-1 p-6">
                      <CardHeader className="p-0 pb-3 text-center">
                        <div className="relative">
                          <CardTitle className="flex justify-center">
                            {product.name}
                          </CardTitle>
                          <Badge className="absolute right-[-10px] top-[-10px] scale-100 bg-red-500 hover:bg-red-600 text-white">
                            POPULAR
                          </Badge>
                        </div>
                        <div className="mt-4 text-4xl font-bold">
                          ${product.price}
                        </div>
                        <CardDescription className="mt-2">
                          {product.description || "Most Popular Choice"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="mt-4 flex justify-center p-0">
                        <ul className="space-y-2">
                          <li className="flex flex-row items-center">
                            <CircleCheck className="mr-2 size-4" />
                            {`${product.credits} Credits`}
                          </li>
                          <li className="flex flex-row items-center">
                            <CircleCheck className="mr-2 size-4" />
                            {`Generate ${Math.floor(product.credits / 10)} Images`}
                          </li>
                          <li className="flex flex-row items-center">
                            <CircleCheck className="mr-2 size-4" />
                            Priority Support
                          </li>
                        </ul>
                      </CardContent>
                    </div>
                    <CardFooter className="mt-auto p-6 pt-0">
                      <PricingButton product={product} />
                    </CardFooter>
                  </BackgroundGradient>
                ) : (
                  <Card className="flex h-full w-full flex-col rounded-2xl border-gray-400">
                    <div className="flex-1 p-6">
                      <CardHeader className="p-0 pb-3 text-center">
                        <CardTitle>{product.name}</CardTitle>
                        <div className="mt-4 text-4xl font-bold">
                          ${product.price}
                        </div>
                        <CardDescription className="mt-2">
                          {product.description ||
                            (index === 0 ? "Starter Experience" : "Premium User Choice")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="mt-4 flex justify-center p-0">
                        <ul className="space-y-2">
                          <li className="flex flex-row items-center">
                            <CircleCheck className="mr-2 size-4" />
                            {`${product.credits} Credits`}
                          </li>
                          <li className="flex flex-row items-center">
                            <CircleCheck className="mr-2 size-4" />
                            {`Generate ${Math.floor(product.credits / 10)} Images`}
                          </li>
                          {index === 2 && (
                            <li className="flex flex-row items-center">
                              <CircleCheck className="mr-2 size-4" />
                              Priority Support
                            </li>
                          )}
                        </ul>
                      </CardContent>
                    </div>
                    <CardFooter className="mt-auto p-6 pt-0">
                      <PricingButton product={product} />
                    </CardFooter>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-8 flex justify-center">
          <p className="text-sm text-gray-600">
            All plans are one-time payments, no subscription
          </p>
        </div>
      </div>
    </section>
  );
}

function PricingButton({ product }: { product: Product }) {
  const [isPending, startTransition] = useTransition();
  const userData = useUserDataStore((s) => s.userData);
  const setShowSignInModal = useSignInDialog((s) => s.setOpen);

  const checkoutWithProps = checkout.bind(null, {
    price_id: product.price_id,
    credits: product.credits,
  });

  return (
    <Button
      // className="mx-auto w-1/2 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
      className="mx-auto w-1/2 rounded-full border border-blue-500 bg-blue-500 text-white transition-colors hover:bg-white hover:text-blue-700"
      onClick={() => {
        if (!userData) {
          setShowSignInModal(true);
        } else {
          startTransition(async () => {
            await checkoutWithProps();
          });
        }
      }}
      disabled={isPending}
    >
      {isPending ? (
        <LoadingDots color="#808080" />
      ) : (
        <>
          <p>Buy Now</p>
        </>
      )}
    </Button>
  );
}
