import Deck from "./Deck";
import { AnimalCard, Card, DisasterCard, ElementCard, PlantCard } from "@/state/types";
import { useThree } from "@react-three/fiber";
import { ColorManagement, SRGBColorSpace } from "three";
import { useGameState } from "@/context/game-state/hook";
import { find, keys, map } from "lodash-es";
import { AnimatePresence } from "framer-motion";
import React from "react";
import PlayerTitle from "@/components/PlayerTitle";
import Stage from "./Stage";
import CardComponent from "@/components/utils/CardWithProvider";
import AbilityToken from "@/components/utils/AbilityTokenWithProvider";
import Tile from "@/components/utils/TileWithProvider";
import { useSelector } from "@xstate/react";
import { MachineSelectors } from "@/state/machines/selectors";
import EndTurnButton from "./ui/endTurnButton";
import Policies from "./Policies/Policies";
import PolicyCard from "./Policies/PolicyCard";
import FundingCard from "./Policies/FundingCard";

const Croupier = () => {
  const { state: gameState, uiState, actorRef, snap, gameConfig } = useGameState();
  const { emit, test, hasTag, guards } = useGameState();
  const exhaustedCards = useSelector(actorRef, MachineSelectors.exhaustedCards);
  const { gl } = useThree();
  ColorManagement.enabled = true;
  gl.outputColorSpace = SRGBColorSpace;
  const currentAbility = useSelector(actorRef, MachineSelectors.currentAbility);

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
      <Policies />
      {gameConfig.useSpecialCards &&
        [...(gameState.stage?.effect ?? []), ...(gameState.stage?.cause ?? [])]
          .filter((s) => s.startsWith("policy-"))
          .map((cardUid) => {
            if (find(gameState.policyMarket.funding, { uid: cardUid })) {
              return <FundingCard key={cardUid} cardUid={cardUid} />;
            }

            const policyCard =
              find(gameState.policyMarket.acquired, { uid: cardUid }) ??
              find(gameState.policyMarket.table, { uid: cardUid });
            return policyCard ? (
              <PolicyCard
                key={cardUid}
                card={policyCard}
                isActive={gameState.policyMarket.active.some((policyCard) => policyCard.uid === cardUid)}
                isOpaque={true}
                allowActivation={false}
              />
            ) : null;
          })}

      {/* Stage */}
      <Stage key="stage" />

      {/* Extinction tiles */}
      {[...gameState.extinctMarket.deck, ...gameState.extinctMarket.table].map((extinctionTile) => (
        <Tile
          key={extinctionTile.uid}
          tileUid={extinctionTile.uid}
          type="extinction"
          isGlossy={gameState.stage?.effect?.includes(extinctionTile.uid)}
          withFloatAnimation={
            gameState.stage?.effect?.includes(extinctionTile.uid) && gameState.stage.eventType !== "gameLoss"
          }
          isAcquired={map(gameState.extinctMarket.table, "uid").includes(extinctionTile.uid)}
        />
      ))}

      {/* Habitat tiles */}
      {gameState.habitatMarket.deck.map((habitatTile) => (
        <Tile
          key={habitatTile.uid}
          tileUid={habitatTile.uid}
          name={habitatTile.name}
          type="habitat"
          isGlossy={gameState.stage?.effect?.includes(habitatTile.uid)}
          withFloatAnimation={
            gameState.stage?.effect?.includes(habitatTile.uid) && gameState.stage.eventType !== "gameWin"
          }
          isAcquired={habitatTile.isAcquired}
          onClick={emit.habitatTileClick(habitatTile.name)}
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

      {test.playerEndTurnClick() && !guards.endPhase() && <EndTurnButton key="end-turn-button" />}
    </AnimatePresence>
  );
};

export default Croupier;
