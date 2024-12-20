import { useControls } from "leva";
import { useGameState } from "@/context/game-state/hook";
import { find, without, uniq } from "lodash-es";
import { TurnMachineContext } from "@/state/machines/turn";
import { useEffect } from "react";
import { useSelector } from "@xstate/react";
import { PolicyCard } from "@/state/types";

export const useExpPackControls = () => {
  const { emit, actorRef } = useGameState();
  const policyCards = useSelector(actorRef, ({ context }: { context: TurnMachineContext }) =>
    uniq(context.policyMarket.deck.map((card) => card.name).sort()),
  );

  const cardOptions = {
    ["---"]: "---",
    ...policyCards.reduce((acc, name) => ({ ...acc, [name]: name }), {}),
  };

  const [{ selectedCard }, set] = useControls(
    "Expansion Pack",
    () => ({
      selectedCard: {
        label: "Activate Card",
        value: "---",
        options: cardOptions,
      },
    }),
    [cardOptions],
  );

  useEffect(() => {
    if (selectedCard && selectedCard !== "---") {
      const snap = actorRef.getSnapshot();
      const card = find(snap.context.policyMarket.deck, { name: selectedCard }) as PolicyCard;
      const fundingCard = find(snap.context.policyMarket.deck, { name: "Funding" }) as PolicyCard;

      emit.iddqd({
        policyMarket: {
          ...snap.context.policyMarket,
          deck: without(snap.context.policyMarket.deck, card, fundingCard),
          acquired: [...snap.context.policyMarket.acquired, card],
          funding: [...snap.context.policyMarket.funding, fundingCard],
        },
      })();
      emit.acquiredPolicyCardClick(card)();

      set({ selectedCard: "---" });
    }
  }, [selectedCard, emit, set, actorRef]);

  return null;
};
