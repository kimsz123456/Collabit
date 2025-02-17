"use client";

import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/ui/carousel";
import { Button } from "@/shared/ui/button";
import DotIndicator from "@/entities/common/ui/DotIndicator";
import { X } from "lucide-react";
import useModalStore from "@/shared/lib/stores/modalStore";

interface CarouselModalProps {
  title: string;
  description: string;
  images: string[];
}

const CarouselModal = ({ title, description, images }: CarouselModalProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const { closeModal } = useModalStore();

  useEffect(() => {
    if (!api) return;

    const handleSelect = () => {
      setCurrent(api.selectedScrollSnap() + 1);
    };

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", handleSelect);

    return () => {
      api.off("select", handleSelect);
    };
  }, [api]);

  return (
    <>
      <div
        className="fixed inset-0 z-10 bg-black/50"
        onClick={(e) => {
          e.stopPropagation();
          closeModal();
        }}
      />
      <div
        className="fixed left-1/2 top-1/2 z-20 min-w-[320px] -translate-x-1/2 -translate-y-1/2 transform flex-col items-center justify-center rounded-xl bg-white p-8 shadow-2xl transition-all md:min-w-[440px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <Button
          type="button"
          variant="ghost"
          className="absolute right-2 top-2"
          onClick={closeModal}
        >
          <X />
        </Button>
        <div className="flex flex-col items-center justify-center gap-4 px-6">
          <h1 id="modal-title" className="text-xl font-bold text-gray-800">
            {title}
          </h1>
          <p className="whitespace-pre text-center text-sm text-gray-600">
            {description}
          </p>

          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
            }}
            className="h-[300px] w-full"
          >
            <CarouselContent className="h-full">
              {images.map((src, index) => (
                <CarouselItem key={index} className="h-full w-full">
                  <img
                    src={src}
                    alt={`Slide ${index + 1}`}
                    className="h-full w-full rounded-lg object-contain"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious type="button" className="hidden md:flex" />
            <CarouselNext type="button" className="hidden md:flex" />
          </Carousel>

          <DotIndicator
            current={current}
            count={count}
            api={api}
            setCurrent={setCurrent}
            setCount={setCount}
          />
        </div>
      </div>
    </>
  );
};

export default CarouselModal;
