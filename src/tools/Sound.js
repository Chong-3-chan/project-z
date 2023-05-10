import React, { useEffect, useRef, useState } from 'react'
import { wait } from '../data/extra-test-data';
function Player() {
  this.volume = 1, this.count = 0,
    this.pool = {};
}
Player.prototype.setVolume = function (volume) {
  this.volume = volume;
  for (let i in this.pool) this.pool[i].volume = this.volume;
}
Player.prototype.play = function (src) {
  if (!src) return;
  const audio = new Audio(src);
  const nowCount = this.count;
  this.count++;
  audio.volume = this.volume;
  this.pool[nowCount] = audio;
  audio.play();
  audio.onended = () => { delete this.pool[nowCount]; }
}
export const player = new Player();
function Sound({ audioFile, options: _options, getVolume, display, audioFileKey }) {
  // const bb =(getVolume());
  const { current: soundState } = useRef(
    (() => {
      const audio = new Audio(), options = Object.fromEntries(_options.map(o => [o, true]));
      if (options.loop) audio.loop = true;
      if (options.fade) options.fade = { in: null, out: null };
      return {
        audio,
        options,
        volume: getVolume()
      }
    })()
  );
  soundState && (({ audio, options, volume }) => {
    if (!audio.ended && audio.paused) {
      audio.volume = volume;
    }
    if (!audioFile && !audio.src) return;
    if (audioFile != audio.src) {
      if (options.fade) {
        options.fade.src = audioFile;
        options.fade.vol = volume;

        if (!options.fade.in && !options.fade.out) {
          options.fade.in = (async () => {
            if (audio.src) {
              await new Promise((resolve) => {
                const interval = setInterval(() => {
                  if ((audio.volume - volume / 30) > 0) {
                    audio.volume -= volume / 30;
                  }
                  else {
                    audio.volume = 0;
                    clearInterval(interval);
                    resolve();
                  }
                }, 50)
              })
            }
            else {
              await new Promise((resolve) => {
                const interval = setInterval(() => {
                  audio.volume = 0;
                  clearInterval(interval);
                  resolve();
                }, 50)
              })
            }
            options.fade.in = null;
          })()
          options.fade.out = options.fade.in.then(async () => {
            await wait(1000);
            await new Promise((resolve) => {
              const interval = setInterval(() => {
                if (audio.src != options.fade.src) {
                  audio.volume = 0;
                  if (options.fade.src) {
                    audio.src = options.fade.src;
                  } else {
                    delete audio.src;
                    clearInterval(interval);
                    resolve();
                    return;
                  }
                  audio.src && audio.play();
                }
                if ((audio.volume + options.fade.vol / 30) < options.fade.vol) {
                  audio.volume += options.fade.vol / 30;
                }
                else {
                  audio.volume = options.fade.vol;
                  clearInterval(interval);
                  resolve();
                }
              }, 50)
            })
            options.fade.out = null;
          });
        }
      }
      else {
        if (audioFile) {
          audio.src = audioFile;
        } else delete audio.src;
        audioFile && audio.play();
      }
    }
  })(soundState);
  useEffect(() => {
    if (!soundState) return;
    const { options } = soundState;
    if (options.fade) {
      options.fade.src = audioFile;
    }
  }, [audioFile, soundState])

  useEffect(() => {
    if (!soundState) return;
    soundState.volume = getVolume();
    const { options, volume } = soundState;
    if (options.fade) {
      options.fade.vol = volume;
    }
    soundState.audio.volume = volume;
  }, [soundState, getVolume()])
  return (
    display &&
    <div key={audioFileKey} className={`sound ${display.class} show`}>
      {audioFileKey}
    </div>
  );
}
export default Sound