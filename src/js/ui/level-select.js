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
    const totalLevels = 100;

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
