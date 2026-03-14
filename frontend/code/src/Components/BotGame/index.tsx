import { useCallback, useEffect, useRef, useState } from "react";
import { Circle, Layer, Line, Rect, Stage } from "react-konva";
import {
  BsFillArrowLeftCircleFill,
  BsFillArrowRightCircleFill,
} from "react-icons/bs";
import { useNavigate } from "react-router-dom";

type GameStatus = "playing" | "ended";
type Difficulty = "easy" | "medium" | "hard";

type GameState = {
  ballX: number;
  ballY: number;
  ballVX: number;
  ballVY: number;
  paddleLeftY: number;
  paddleRightY: number;
  p1Score: number;
  p2Score: number;
  status: GameStatus;
  winner: "player" | "bot" | null;
};

const TARGET_SCORE = 5;
const DIFFICULTY_SETTINGS: Record<
  Difficulty,
  {
    aiSpeedFactor: number;
    reactionMs: number;
    aimNoise: number;
    maxBallSpeedFactor: number;
  }
> = {
  easy: {
    aiSpeedFactor: 0.55,
    reactionMs: 220,
    aimNoise: 0.35,
    maxBallSpeedFactor: 0.9,
  },
  medium: {
    aiSpeedFactor: 0.8,
    reactionMs: 120,
    aimNoise: 0.18,
    maxBallSpeedFactor: 1.0,
  },
  hard: {
    aiSpeedFactor: 1.05,
    reactionMs: 60,
    aimNoise: 0.08,
    maxBallSpeedFactor: 1.1,
  },
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const createInitialState = (
  width: number,
  height: number,
  direction: "player" | "bot" = "player",
): GameState => {
  const baseSpeed = width * 0.6;
  const angle = (Math.random() * Math.PI) / 3 - Math.PI / 6;
  const vx = Math.cos(angle) * baseSpeed * (direction === "player" ? 1 : -1);
  const vy = Math.sin(angle) * baseSpeed;
  return {
    ballX: width / 2,
    ballY: height / 2,
    ballVX: vx,
    ballVY: vy,
    paddleLeftY: height / 2 - height / 12,
    paddleRightY: height / 2 - height / 12,
    p1Score: 0,
    p2Score: 0,
    status: "playing",
    winner: null,
  };
};

export const BotGame = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const keysRef = useRef({ up: false, down: false });
  const stateRef = useRef<GameState>(createInitialState(800, 450));
  const aiAimRef = useRef(0);
  const aiLastReactionRef = useRef(0);

  const [dimensions, setDimensions] = useState({ width: 800, height: 450 });
  const [gameState, setGameState] = useState<GameState>(stateRef.current);
  const [isMobile, setIsMobile] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const difficultyLevels: Difficulty[] = ["easy", "medium", "hard"];

  const resetGame = useCallback(() => {
    const fresh = createInitialState(dimensions.width, dimensions.height);
    stateRef.current = fresh;
    setGameState(fresh);
    aiAimRef.current = dimensions.height / 2;
    aiLastReactionRef.current = 0;
  }, [dimensions.height, dimensions.width]);

  const resetBall = useCallback(
    (direction: "player" | "bot") => {
      const baseSpeed = dimensions.width * 0.6;
      const angle = (Math.random() * Math.PI) / 2 - Math.PI / 4;
      const vx =
        Math.cos(angle) * baseSpeed * (direction === "player" ? 1 : -1);
      const vy = Math.sin(angle) * baseSpeed;
      stateRef.current.ballX = dimensions.width / 2;
      stateRef.current.ballY = dimensions.height / 2;
      stateRef.current.ballVX = vx;
      stateRef.current.ballVY = vy;
    },
    [dimensions.height, dimensions.width],
  );

  const updateDimensions = useCallback(() => {
    const containerWidth = containerRef.current?.offsetWidth ?? 800;
    const width = Math.max(containerWidth, 320);
    const height = Math.max((width * 9) / 16, 240);
    setDimensions({ width, height });
    setIsMobile(width <= 742);
  }, []);

  useEffect(() => {
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, [updateDimensions]);

  useEffect(() => {
    const fresh = createInitialState(dimensions.width, dimensions.height);
    stateRef.current = fresh;
    setGameState(fresh);
  }, [dimensions.height, dimensions.width]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowUp") keysRef.current.up = true;
      if (event.key === "ArrowDown") keysRef.current.down = true;
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "ArrowUp") keysRef.current.up = false;
      if (event.key === "ArrowDown") keysRef.current.down = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    let lastTime = performance.now();

    const step = (time: number) => {
      const state = stateRef.current;
      if (state.status === "playing") {
        const dt = Math.min((time - lastTime) / 1000, 0.02);
        lastTime = time;

        const paddleHeight = dimensions.height / 6;
        const paddleWidth = dimensions.width / 70;
        const gap = dimensions.width / 100;
        const ballRadius = dimensions.width / 42;
        const playerSpeed = dimensions.height * 1.2;
        const difficultyConfig = DIFFICULTY_SETTINGS[difficulty];
        const aiSpeed =
          dimensions.height * 0.9 * difficultyConfig.aiSpeedFactor;
        const maxBallSpeed =
          dimensions.width * 1.1 * difficultyConfig.maxBallSpeedFactor;

        if (keysRef.current.up) {
          state.paddleLeftY = clamp(
            state.paddleLeftY - playerSpeed * dt,
            0,
            dimensions.height - paddleHeight,
          );
        }
        if (keysRef.current.down) {
          state.paddleLeftY = clamp(
            state.paddleLeftY + playerSpeed * dt,
            0,
            dimensions.height - paddleHeight,
          );
        }

        const now = performance.now();
        if (
          aiLastReactionRef.current === 0 ||
          now - aiLastReactionRef.current >= difficultyConfig.reactionMs
        ) {
          aiLastReactionRef.current = now;
          const noise =
            (Math.random() * 2 - 1) *
            difficultyConfig.aimNoise *
            paddleHeight;
          aiAimRef.current = state.ballY + noise;
        }
        const aiTarget = aiAimRef.current - paddleHeight / 2;
        const aiDelta = clamp(
          aiTarget - state.paddleRightY,
          -aiSpeed * dt,
          aiSpeed * dt,
        );
        state.paddleRightY = clamp(
          state.paddleRightY + aiDelta,
          0,
          dimensions.height - paddleHeight,
        );

        state.ballX += state.ballVX * dt;
        state.ballY += state.ballVY * dt;

        if (
          state.ballY - ballRadius <= 0 ||
          state.ballY + ballRadius >= dimensions.height
        ) {
          state.ballVY *= -1;
        }

        const leftPaddleX = gap + paddleWidth;
        if (
          state.ballVX < 0 &&
          state.ballX - ballRadius <= leftPaddleX &&
          state.ballY >= state.paddleLeftY &&
          state.ballY <= state.paddleLeftY + paddleHeight
        ) {
          const relative =
            (state.ballY - (state.paddleLeftY + paddleHeight / 2)) /
            (paddleHeight / 2);
          const speed = Math.min(Math.abs(state.ballVX) * 1.05, maxBallSpeed);
          state.ballVX = speed;
          state.ballVY = clamp(
            relative * speed * 0.8,
            -maxBallSpeed * 0.6,
            maxBallSpeed * 0.6,
          );
        }

        const rightPaddleX = dimensions.width - gap - paddleWidth;
        if (
          state.ballVX > 0 &&
          state.ballX + ballRadius >= rightPaddleX &&
          state.ballY >= state.paddleRightY &&
          state.ballY <= state.paddleRightY + paddleHeight
        ) {
          const relative =
            (state.ballY - (state.paddleRightY + paddleHeight / 2)) /
            (paddleHeight / 2);
          const speed = Math.min(Math.abs(state.ballVX) * 1.05, maxBallSpeed);
          state.ballVX = -speed;
          state.ballVY = clamp(
            relative * speed * 0.8,
            -maxBallSpeed * 0.6,
            maxBallSpeed * 0.6,
          );
        }

        if (state.ballX + ballRadius < 0) {
          state.p2Score += 1;
          if (state.p2Score >= TARGET_SCORE) {
            state.status = "ended";
            state.winner = "bot";
          } else {
            resetBall("player");
          }
        }

        if (state.ballX - ballRadius > dimensions.width) {
          state.p1Score += 1;
          if (state.p1Score >= TARGET_SCORE) {
            state.status = "ended";
            state.winner = "player";
          } else {
            resetBall("bot");
          }
        }

        setGameState({ ...state });
      }

      animationRef.current = requestAnimationFrame(step);
    };

    animationRef.current = requestAnimationFrame(step);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions.height, dimensions.width, difficulty, resetBall]);

  const handleMove = useCallback(
    (event: any) => {
      const paddleHeight = dimensions.height / 6;
      const nextY = event.evt.layerY - paddleHeight / 2;
      stateRef.current.paddleLeftY = clamp(
        nextY,
        0,
        dimensions.height - paddleHeight,
      );
    },
    [dimensions.height],
  );

  const handleTouchMove = useCallback(
    (event: any) => {
      const paddleHeight = dimensions.height / 6;
      const nextY = event.evt.layerY - paddleHeight / 2;
      stateRef.current.paddleLeftY = clamp(
        nextY,
        0,
        dimensions.height - paddleHeight,
      );
    },
    [dimensions.height],
  );

  const moveUp = () => {
    const paddleHeight = dimensions.height / 6;
    stateRef.current.paddleLeftY = clamp(
      stateRef.current.paddleLeftY - dimensions.height / 20,
      0,
      dimensions.height - paddleHeight,
    );
    setGameState({ ...stateRef.current });
  };

  const moveDown = () => {
    const paddleHeight = dimensions.height / 6;
    stateRef.current.paddleLeftY = clamp(
      stateRef.current.paddleLeftY + dimensions.height / 20,
      0,
      dimensions.height - paddleHeight,
    );
    setGameState({ ...stateRef.current });
  };

  const paddleHeight = dimensions.height / 6;
  const paddleWidth = dimensions.width / 70;
  const gap = dimensions.width / 100;
  const ballRadius = dimensions.width / 42;

  return (
    <div className="flex flex-col gap-8 items-center justify-start pt-10 h-full w-full">
      <div className="flex flex-col gap-4 w-full max-w-4xl px-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-lexend text-xs uppercase tracking-[0.3em] text-secondary">
              Difficulty
            </span>
            <div className="flex items-center gap-2 rounded-full bg-base-200 px-2 py-1">
              {difficultyLevels.map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    difficulty === level
                      ? "bg-primary text-white"
                      : "text-neutral/70 hover:text-neutral"
                  }`}
                  onClick={() => {
                    setDifficulty(level as Difficulty);
                    resetGame();
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          <button className="btn btn-ghost" onClick={() => navigate("/Play")}>
            Back
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary"></div>
          <span className="font-lexend font-extrabold text-2xl text-neutral">
            {gameState.p1Score}
          </span>
          <span className="font-lexend text-sm text-neutral">You</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-lexend text-sm text-neutral">Bot</span>
          <span className="font-lexend font-extrabold text-2xl text-neutral">
            {gameState.p2Score}
          </span>
          <div className="w-10 h-10 rounded-full bg-secondary"></div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative flex items-center justify-center min-h-16 max-h-[80%] max-w-[900px] min-w-92 w-[95%] rounded-xl border-primary border-4"
      >
        <Stage
          onMouseMove={handleMove}
          onTouchMove={handleTouchMove}
          width={dimensions.width}
          height={dimensions.height}
          style={{
            borderWidth: "4px",
            borderColor: "#7940CF",
            borderRadius: "4px",
          }}
        >
          <Layer>
            <Rect
              height={dimensions.height}
              width={dimensions.width}
              fill="#151B26"
              x={0}
              y={0}
            />
            <Line
              points={[0, dimensions.height, 0, 0]}
              dash={[dimensions.height / 30, 10]}
              strokeWidth={2}
              stroke="white"
              height={dimensions.height}
              width={20}
              fill="white"
              x={dimensions.width / 2}
              y={0}
            />
            <Rect
              cornerRadius={12}
              height={paddleHeight}
              width={paddleWidth}
              x={gap}
              y={gameState.paddleLeftY}
              fill="white"
            />
            <Rect
              cornerRadius={12}
              height={paddleHeight}
              width={paddleWidth}
              x={dimensions.width - gap - paddleWidth}
              y={gameState.paddleRightY}
              fill="white"
            />
            <Circle
              fill="white"
              radius={ballRadius / 2}
              x={gameState.ballX}
              y={gameState.ballY}
            />
          </Layer>
        </Stage>

        {gameState.status === "ended" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="flex flex-col items-center gap-4 bg-base-200 px-8 py-6 rounded-xl">
              <div className="font-lexend font-extrabold text-xl text-neutral">
                {gameState.winner === "player" ? "You win" : "Bot wins"}
              </div>
              <div className="flex gap-4">
                <button className="btn btn-primary" onClick={resetGame}>
                  Play again
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => navigate("/Play")}
                >
                  Back to Play
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {isMobile && (
        <div className="flex justify-around items-center w-full gap-20">
          <BsFillArrowLeftCircleFill
            onClick={moveUp}
            className="w-14 h-14 hover:cursor-pointer hover:fill-secondary hover:transition-colors delay-100"
          />
          <BsFillArrowRightCircleFill
            onClick={moveDown}
            className="w-14 h-14 hover:cursor-pointer hover:fill-secondary hover:transition-colors delay-100"
          />
        </div>
      )}
    </div>
  );
};
