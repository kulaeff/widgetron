import { type ChangeEvent, type FC, useEffect, useMemo, useState } from "react";
import type { Spec } from "@json-render/react";
import * as Styled from "./styled";
import { Button } from "../Button";
import { useTranslation } from "react-i18next";

type VisibilityValue = Spec["elements"][string]["visible"] | boolean | undefined;
type VisibilityConditionValue = Exclude<VisibilityValue, boolean | undefined>;

type VisibilityMode = "always" | "hidden" | "condition";

const getVisibilityMode = (value: VisibilityValue): VisibilityMode => {
  if (value === false) return "hidden";
  if (value === true || value === undefined) return "always";
  return "condition";
};

const getConditionText = (value: VisibilityValue): string => {
  if (typeof value === "object" && value !== null) {
    return JSON.stringify(value);
  }

  return '{ "$state": "/path/to/value" }';
};

const parseConditionText = (value: string): VisibilityConditionValue | null => {
  const parsed = JSON.parse(value);
  if (typeof parsed !== "object" || parsed === null) {
    return null;
  }

  return parsed as VisibilityConditionValue;
};

interface VisibilityEditorProps {
  value: VisibilityValue;
  onChange: (value: VisibilityValue) => void;
}

export const VisibilityEditor: FC<VisibilityEditorProps> = ({ value, onChange }) => {
  const { t } = useTranslation();

  const [mode, setMode] = useState<VisibilityMode>(() => getVisibilityMode(value));
  const [conditionText, setConditionText] = useState(() => getConditionText(value));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const nextMode = getVisibilityMode(value);
    setMode(nextMode);
    setConditionText(getConditionText(value));
    setError(null);
  }, [value]);

  const parsedCondition = useMemo(() => {
    if (mode !== "condition") {
      return null;
    }

    try {
      const parsed = parseConditionText(conditionText);
      if (!parsed) {
        return { error: "Условие должно быть объектом или массивом условий" };
      }

      return { value: parsed };
    } catch {
      return { error: "Некорректный JSON" };
    }
  }, [conditionText, mode]);

  useEffect(() => {
    if (mode !== "condition") {
      setError(null);
      return;
    }

    if (parsedCondition && "error" in parsedCondition) {
      setError(parsedCondition.error ?? "Некорректное условие");
      return;
    }

    setError(null);
  }, [mode, parsedCondition]);

  const handleModeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextMode = event.target.value as VisibilityMode;
    setMode(nextMode);

    if (nextMode === "always") {
      onChange(true);
      return;
    }

    if (nextMode === "hidden") {
      onChange(false);
      return;
    }

    if (parsedCondition && "value" in parsedCondition) {
      onChange(parsedCondition.value);
    }
  };

  const handleApplyCondition = () => {
    if (mode !== "condition" || !parsedCondition || !("value" in parsedCondition)) {
      return;
    }

    onChange(parsedCondition.value);
  };

  const handleResetCondition = () => {
    const fallback = '{ "$state": "/path/to/value" }';
    setConditionText(fallback);
    setError(null);
  };

  return (
    <Styled.Container>
      <Styled.Row>
        <Styled.Label>{t("режим")}</Styled.Label>
        <Styled.Select value={mode} onChange={handleModeChange}>
          <option value="always">{t("всегда видно")}</option>
          <option value="hidden">{t("всегда скрыто")}</option>
          <option value="condition">{t("условие")}</option>
        </Styled.Select>
      </Styled.Row>

      {mode === "condition" ? (
        <>
          <Styled.Row>
            <Styled.Label>{t("условие")}</Styled.Label>
            <Styled.Input
              value={conditionText}
              onChange={(e) => setConditionText(e.target.value)}
            />
            {error ? <Styled.ErrorText>{error}</Styled.ErrorText> : null}
          </Styled.Row>

          <Styled.Actions>
            <Button
              disabled={!!error}
              label={t("применить")}
              size="sm"
              onClick={handleApplyCondition}
            />
            <Button
              label={t('сбросить')}
              size="sm"
              variant="secondary"
              onClick={handleResetCondition}
            />
          </Styled.Actions>
        </>
      ) : null}
    </Styled.Container>
  );
};
