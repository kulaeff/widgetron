import {
  Children,
  type FC,
  type HTMLAttributes,
  type PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from "react";
import * as Styled from "./styled";

interface SliderProps extends HTMLAttributes<HTMLDivElement> {
  autoplay?: boolean | number;
  loop?: boolean | number;
}

export const Slider: FC<PropsWithChildren<SliderProps>> = ({
  children,
  autoplay,
  loop,
  ...rest
}) => {
  const slides = Children.toArray(children);
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideCount, setSlideCount] = useState(0);

  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (trackRef.current) {
      setSlideCount(trackRef.current.children.length);
    }
  }, []);

  useEffect(() => {
    if (activeIndex >= slideCount && loop) {
      setActiveIndex(Math.max(0, slideCount - 1));
    }
  }, [activeIndex, slideCount, loop]);

  return (
    <Styled.Slider {...rest}>
      <Styled.Container>
        <Styled.Track
          ref={trackRef}
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {slides}
        </Styled.Track>
      </Styled.Container>
      {slideCount > 1 ? (
        <Styled.Dots as="nav" aria-label="Слайды">
          {Array.from({ length: slideCount }).map((_, index) => (
            <Styled.Dot
              key={index}
              type="button"
              aria-label={`Слайд ${index + 1} из ${slideCount}`}
              aria-current={index === activeIndex ? "true" : undefined}
              $active={index === activeIndex}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </Styled.Dots>
      ) : null}
    </Styled.Slider>
  );
};
