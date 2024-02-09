import { Ball } from "./Ball";
import { Paddle } from "./Paddle";

export default class Canvas {
  canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D | null;

  constructor(id: string) {
    this.canvas = document.querySelector(id) as HTMLCanvasElement
    this.context = this.canvas.getContext('2d')
  }

  clear() {
    this.context?.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  drawImage(image: Paddle | Ball, x: number, y: number): void {
    if (image) {
      this.context?.drawImage(image.image, x, y, image.width, image.height);
    }
  }
}
