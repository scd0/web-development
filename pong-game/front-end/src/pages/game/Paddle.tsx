import { IVector } from "../../definitions";

export class Paddle {
  private paddleImage: HTMLImageElement = new Image();
  private moveUp: boolean;
  private moveDown: boolean;

  constructor(
    private speed: number,
    private paddleWidth: number,
    private paddleHeight: number,
    private position: IVector,
    image: string
  ) {
    this.speed = speed;
    this.paddleWidth = paddleWidth;
    this.paddleHeight = paddleHeight;
    this.position = position;
    this.moveUp = false;
    this.moveDown = false;
    this.paddleImage.src = image;

    // Event Listeners
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
  }

  // Getters
  get width(): number {
    return this.paddleWidth;
  }

  get height(): number {
    return this.paddleHeight;
  }

  get pos(): IVector {
    return this.position;
  }

  get image(): HTMLImageElement {
    return this.paddleImage;
  }

  get isMovingUp(): boolean {
    return this.moveUp;
  }

  get isMovingDown(): boolean {
    return this.moveDown;
  }

  movePaddle(): void {
    if (this.moveUp) this.pos.y -= this.speed;
    if (this.moveDown) this.pos.y += this.speed;
  }

  handleKeyUp = (e: KeyboardEvent): void => {
    if (e.code === 'ArrowUp' || e.key === 'ArrowUp') this.moveUp = false;
    if (e.code === 'ArrowDown' || e.key === 'ArrowDown')
      this.moveDown = false;
  };

  handleKeyDown = (e: KeyboardEvent): void => {
    if (e.code === 'ArrowUp' || e.key === 'ArrowUp') this.moveUp = true;
    if (e.code === 'ArrowDown' || e.key === 'ArrowDown')
      this.moveDown = true;
  };
}