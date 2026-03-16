import { MAX_LEVELS } from "../levels/loader.js";
import { StorageManager } from "../state/storage.js";

export class LevelSelect {
  constructor(containerId, onLevelSelect) {
    // containerId is now the ID of the wrapper div (e.g., 'level-select-screen')
    this.container = document.getElementById(containerId);
    this.onLevelSelect = onLevelSelect;
    this.storage = new StorageManager();
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = "";
    this.container.classList.remove("hidden");

    const progress = this.storage.loadProgress();
    const totalLevels = MAX_LEVELS;

    const title = document.createElement("h1");
    title.textContent = "Select Level";
    this.container.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "level-grid";

    for (let i = 1; i <= totalLevels; i++) {
      const levelData = progress.levels[i] || { unlocked: false, stars: 0 };
      const btn = document.createElement("button");
      btn.className = "level-btn";

      if (!levelData.unlocked) {
        btn.disabled = true;
      } else {
        btn.onclick = () => this.onLevelSelect(i);
      }

      const numberSpan = document.createElement("span");
      numberSpan.className = "level-number";
      numberSpan.textContent = i;
      btn.appendChild(numberSpan);

      const starsDiv = document.createElement("div");
      starsDiv.className = "stars";
      if (levelData.unlocked && levelData.stars > 0) {
        starsDiv.textContent = "★".repeat(levelData.stars);
      }
      btn.appendChild(starsDiv);

      if (levelData.bestTime !== null && levelData.bestTime !== undefined) {
        const timeDiv = document.createElement("div");
        timeDiv.className = "best-time";
        timeDiv.textContent = levelData.bestTime.toFixed(1) + "s";
        btn.appendChild(timeDiv);
      }

      grid.appendChild(btn);
    }

    this.container.appendChild(grid);
  }

  hide() {
    if (this.container) {
      this.container.classList.add("hidden");
    }
  }
}
