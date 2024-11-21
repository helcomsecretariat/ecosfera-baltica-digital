import Deck from "./Deck";
import { AnimalCard, Card, DisasterCard, ElementCard, PlantCard } from "@/state/types";
import { useThree } from "@react-three/fiber";
import { ColorManagement, SRGBColorSpace } from "three";
import { useGameState } from "@/context/game-state/hook";
import { find, keys } from "lodash-es";
import { AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";
import PlayerTitle from "@/components/PlayerTitle";
import Stage from "./Stage";
import CardComponent from "@/components/utils/CardWithProvider";
import AbilityToken from "@/components/utils/AbilityTokenWithProvider";
import Tile from "@/components/utils/TileWithProvider";
import { useSelector } from "@xstate/react";
import { MachineSelectors } from "@/state/machines/selectors";
import Policies from "./Policies";
import PolicyCard from "./PolicyCard";
import CommandBar from "./CommandBar";
import PoliciesButton from "./ui/policiesButton";
import EndTurnButton from "./ui/endTurnButton";

const Croupier = () => {
  const { state: gameState, uiState, actorRef, snap, gameConfig } = useGameState();
  const { emit, test, hasTag, guards } = useGameState();
  const [showPolicies, setShowPolicies] = useState(false);
  const exhaustedCards = useSelector(actorRef, MachineSelectors.exhaustedCards);
  const { gl } = useThree();
  ColorManagement.enabled = true;
  gl.outputColorSpace = SRGBColorSpace;
  const currentAbility = useSelector(actorRef, MachineSelectors.currentAbility);

  useEffect(() => setShowPolicies(false), [gameState.policyMarket.table]);

  return (
    <AnimatePresence>
      {/* Market Cards */}
      {gameState.animalMarket.table.map((card: AnimalCard) => (
        <CardComponent
          key={card.uid}
          card={card}
          gamePieceAppearance={uiState.cardPositions[card.uid]}
          onClick={emit.marketCardClick(card)}
          isHighlighted={test.marketCardClick(card)}
        />
      ))}
      {gameState.plantMarket.table.map((card: PlantCard) => (
        <CardComponent
          key={card.uid}
          card={card}
          gamePieceAppearance={uiState.cardPositions[card.uid]}
          onClick={emit.marketCardClick(card)}
          isHighlighted={test.marketCardClick(card)}
        />
      ))}
      {gameState.disasterMarket.table.map((card: DisasterCard) => (
        <CardComponent
          key={card.uid}
          card={card}
          gamePieceAppearance={uiState.cardPositions[card.uid]}
          // onClick={emit.buyCard(card)}
        />
      ))}

      {keys(gameState.deck.elements)
        .map((name: string) => ({ name, cards: gameState.elementMarket.deck.filter((card) => card.name === name) }))
        .map(({ name, cards }: { name: string; cards: ElementCard[] }) => (
          <Deck
            key={name + "ElementDeck"}
            texturePath={`/ecosfera_baltica/element_${name}.avif`}
            textColor="black"
            gamePieceAppearance={uiState.deckPositions[`${name}ElementDeck`]}
            cards={cards}
            onClick={emit.marketElementClick(name)}
            isHighlighted={hasTag("usingAbility") && test.marketElementClick(name)}
          />
        ))}

      {gameState.turn.borrowedElement && (
        <CardComponent
          key={gameState.turn.borrowedElement.uid}
          card={gameState.turn.borrowedElement}
          gamePieceAppearance={uiState.cardPositions[gameState.turn.borrowedElement.uid]}
          onClick={emit.borrowedElementClick(gameState.turn.borrowedElement)}
          isGlossy={true}
          withFloatAnimation={true}
        />
      )}

      <Deck
        key={"animalDeck"}
        gamePieceAppearance={uiState.deckPositions["animalDeck"]}
        cards={gameState.animalMarket.deck}
        onClick={emit.animalDeckClick()}
        isHighlighted={test.animalDeckClick()}
      />
      <Deck
        key={"plantDeck"}
        gamePieceAppearance={uiState.deckPositions["plantDeck"]}
        cards={gameState.plantMarket.deck}
        onClick={emit.plantDeckClick()}
        isHighlighted={test.plantDeckClick()}
      />
      <Deck
        key={"disasterDeck"}
        gamePieceAppearance={uiState.deckPositions["disasterDeck"]}
        cards={gameState.disasterMarket.deck}
        onClick={() => console.error("Disaster deck click NOT IMPLEMENTED")}
      />

      {/* Player HUDs */}
      {gameState.players.map((player, playerIndex) => (
        <React.Fragment key={player.uid + "HUD"}>
          <Deck
            gamePieceAppearance={uiState.deckPositions[`${player.uid}PlayerDeck`]}
            cards={player.deck}
            onClick={emit.playerDeckClick()}
          />
          <PlayerTitle
            gamePieceAppearance={uiState.deckPositions[`${player.uid}PlayerDeck`]}
            offset={
              // TODO: use positioner for titles as well
              [
                [0, 10, 0],
                [0, 10, 0],
                [0, -13, 0],
                [0, 10, 0],
              ][playerIndex] as [number, number, number]
            }
            text={player.name}
          />
          {player.abilities.map((ability) => (
            <AbilityToken
              key={ability.uid}
              ability={ability}
              color={
                (player.uid === gameState.turn.player &&
                  guards.canRefreshAbility() &&
                  ability.isUsed &&
                  // @ts-expect-error dunno why
                  snap.matches({ stagingEvent: "abilityRefresh" })) ||
                currentAbility?.piece?.uid === ability.uid
                  ? "#1D86BC"
                  : undefined
              }
            />
          ))}
        </React.Fragment>
      ))}

      {/* Policies */}
      {showPolicies && gameConfig.useSpecialCards && <Policies />}
      {gameConfig.useSpecialCards &&
        gameState.stage?.eventType?.includes("policy_") &&
        [...(gameState.stage?.effect ?? []), ...(gameState.stage?.cause ?? [])].map((cardUid) => {
          const policyCard =
            find(gameState.policyMarket.table, { uid: cardUid }) ??
            find(gameState.policyMarket.acquired, { uid: cardUid });
          return policyCard ? <PolicyCard key={cardUid} card={policyCard} /> : null;
        })}

      {/* Stage */}
      <Stage key="stage" />

      {/* Command bar */}
      <CommandBar key="command-bar" />

      {/* Extinction tiles */}
      {[...gameState.extinctMarket.deck, ...gameState.extinctMarket.table].map((extinctionTile) => (
        <Tile
          key={extinctionTile.uid}
          tileUid={extinctionTile.uid}
          color={gameState.extinctMarket.deck.includes(extinctionTile) ? "#c3b091" : "#d17b79"}
          isGlossy={gameState.stage?.effect?.includes(extinctionTile.uid)}
          withFloatAnimation={gameState.stage?.effect?.includes(extinctionTile.uid)}
        />
      ))}

      {/* Habitat tiles */}
      {gameState.habitatMarket.deck.map((habitatTile) => (
        <Tile
          key={habitatTile.uid}
          tileUid={habitatTile.uid}
          name={habitatTile.name}
          color={habitatTile.isAcquired ? "#2cba16" : "#66cc66"}
          isGlossy={gameState.stage?.effect?.includes(habitatTile.uid)}
          withFloatAnimation={gameState.stage?.effect?.includes(habitatTile.uid)}
        />
      ))}

      {/* Player Discard */}
      {gameState.players.map(
        (player) =>
          player.discard.length > 0 && (
            <Deck
              gamePieceAppearance={{
                ...uiState.deckPositions[`${player.uid}PlayerDiscard`],
              }}
              cards={player.discard}
              key={player.uid + "PlayerDiscard"}
              onClick={() => console.error("discard click NOT IMPLEMENTED")}
            />
          ),
      )}

      {/* Player Cards */}
      {gameState.players.flatMap((player) =>
        player.hand.map(
          (card: Card) =>
            uiState.cardPositions[card.uid] && (
              <CardComponent
                key={card.uid}
                card={card}
                gamePieceAppearance={uiState.cardPositions[card.uid]}
                onClick={emit.playerCardClick(card)}
                options={{
                  showAbilityButtons: gameState.turn.player === player.uid && !hasTag("stagingEvent"),
                  dimLevel: 0.3,
                }}
                isHighlighted={
                  ((hasTag("usingAbility") || hasTag("policy")) && test.playerCardClick(card)) ||
                  (guards.isOnStage(card) && guards.isCardBuyStageEvent())
                }
                isGlossy={gameState.stage?.effect?.includes(card.uid)}
                isDimmed={exhaustedCards.includes(card.uid) && !guards.isOnStage(card)}
                withFloatAnimation={gameState.stage?.effect?.includes(card.uid)}
              />
            ),
        ),
      )}

      {gameConfig.useSpecialCards && (
        <PoliciesButton key="policies-button" onClick={() => setShowPolicies(!showPolicies)} />
      )}
      <EndTurnButton key="end-turn-button" />
    </AnimatePresence>
  );
};

export default Croupier;
