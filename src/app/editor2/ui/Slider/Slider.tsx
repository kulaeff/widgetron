import {
  Children,
  FC,
  PropsWithChildren,
  useEffect,
  useState,
} from "react";
import * as Styled from "./styled";

interface SliderProps {
  /** Зарезервировано под автопрокрутку из спеки */
  $autoplay?: boolean | number;
  /** Зарезервировано под зацикливание из спеки */
  $loop?: boolean | number;
}

export const Slider: FC<PropsWithChildren<SliderProps>> = ({
  children,
  $autoplay: _autoPlay,
  $loop: _loop,
}) => {
  const slides = Children.toArray(children);
  const slideCount = slides.length;
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (activeIndex >= slideCount) {
      setActiveIndex(Math.max(0, slideCount - 1));
    }
  }, [activeIndex, slideCount]);

  return (
    <Styled.Slider>
      <Styled.Container>
        <Styled.Track
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {slides}
        </Styled.Track>
      </Styled.Container>
      {slideCount > 1 ? (
        <Styled.Dots as="nav" aria-label="Слайды">
          {slides.map((_, index) => (
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
