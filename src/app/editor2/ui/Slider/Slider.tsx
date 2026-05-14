import { FC, PropsWithChildren, type ReactNode, useState } from "react";
import * as Styled from "./styled";

interface SliderProps {
  slides: ReactNode[];
}

export const Slider: FC<PropsWithChildren<SliderProps>> = ({ children }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <Styled.Container>
      {/* Окно просмотра */}
      <Styled.Container>
        <Styled.Track
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {children}
        </Styled.Track>
      </Styled.Container>

      {/* Точки управления */}
      {/* <div className="slider-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === activeIndex ? 'active' : ''}`}
            onClick={() => setActiveIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div> */}
    </Styled.Container>
  );
};
