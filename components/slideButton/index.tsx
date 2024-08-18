import * as React from "react";
import styles from "./slideButton.module.scss";
import { cn } from "@/lib/utils";

type SilderButtonProps = {
  onChange: (v: string) => void;
  wordsList: string[];
  active?: string;
  device?: "mobile" | "pc";
  className?: string;
};

const SildeButton: React.FC<SilderButtonProps> = ({
  onChange,
  wordsList,
  active,
  device,
  className,
}) => {
  // 1.41rem = 141px and mobile design silde button width is 288px, the pc design silde button width is 340px
  const stepMax = device === "mobile" ? 1.41 : 168;
  const stepMin = device === "mobile" ? 0.01 : 1;
  const [activeIndex, setActiveIndex] = React.useState<number>(0);
  const [step, setStep] = React.useState<number>(
    active === wordsList[0] ? stepMin : stepMax,
  );

  const handleChange = () => {
    if (step === stepMin) {
      setStep(stepMax);
      onChange(wordsList[1]);
      setActiveIndex(1);
    } else {
      setStep(stepMin);
      onChange(wordsList[0]);
      setActiveIndex(0);
    }
  };

  React.useEffect(() => {
    setActiveIndex(wordsList.indexOf(active ? active : wordsList[0]));
    if (wordsList.indexOf(active ? active : wordsList[0]) === 0) {
      setStep(stepMin);
    } else {
      setStep(stepMax);
    }
  }, [active]);

  React.useEffect(() => {
    if (wordsList.length !== 2) {
      throw new Error("In the silde button wordsList length must be 2 !");
    }
  }, []);

  return (
    <div
      className={cn(
        device === "pc"
          ? styles["silde-button-pc"]
          : styles["silde-button-mobile"],
        "mx-auto",
        className,
      )}
    >
      <div
        style={{
          left: 1,
          transform:
            device === "pc" ? `translateX(${step}px)` : `translateX(${step}rem`,
        }}
        className={styles.active}
      >
        {wordsList[activeIndex]}
      </div>
      {wordsList.map((e, i) => (
        <span className={styles["btn-item"]} key={i} onClick={handleChange}>
          {e}
        </span>
      ))}
    </div>
  );
};

export default SildeButton;
