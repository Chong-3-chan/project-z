import React, { useEffect, useRef, useState } from 'react'
import { wait } from '../data/extra-test-data';
import { classNames } from '../App';
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
function Sound({ audioFile, options: _options, getVolume, display, audioFileKey, audio }) {
  // const bb =(getVolume());
  const { current: soundState } = useRef(
    (() => {
      const options = Object.fromEntries(_options.map(o => [o, true]));
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
                    audio.src = null_ogg;
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
        } else {
          audio.pause();
          audio.src = null_ogg;
        }
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
    <div key={audioFileKey} className={classNames("sound", display.class, audioFileKey && "show")}>
      {audioFileKey}
    </div>
  );
}

const null_ogg = 'data:audio/ogg;base64,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Yqy1lJRajLUWAABQ4AAAEGCDpsTiAIWGrAQAogAAEGMQYgxCg4xSjEFoDFKKOQiRUow5JyVSijHnpGSOOSchpYw556CUFEIoJaWWQgilpJRaAQAABQ4AAAE2aEosDlBoyIoAIAoAADAGMYYYQ9AxKZ2UyEEmJZPQOAcpdZQySqXEEmNGqcRWYoygc5RCShmlEmNpMaNUYgyxFAAAduAAAHZgIRQashIAyAMAQIxRijHnnDMIMeWcc84ZhBRzzjnnFGOMOeecc4oxxpxzzjnmnHPOQQghc8455yCE0DnnHIQQQuiccw5CCCF0zjkHIYQQOuecgxBCCAUAABU4AAAE2CiyOcFIUKEhKwGAPAAAwBilnINQSqMUYxBKSalRijEIpaRUOQehlJRaq5yDUEpKrXUQSkmptRg7CKWk1FqMpZSUYowx11BKSy3GWHNqLcYYc805pRZjrTXnXAAA7oIDANiBjSKbE4wEFRqyEgDIAwBAEFKKMcYYQwoxxphjziGkFGOMMecUY4w55pxzSjHGmHPOOcaYc8455xxjjDnnnHOOMeacc845x5xzzjnnnGPOOeecc84x55xzzjnnBAAAFTgAAATYKLI5wUhQoSErAYBwAACACOg455xzzjk3DmKttdZaa601clBrrbXWWmutqdZaa6211lprTbXWWmuttdZaa6211lprrbXWWmuttdZaa6211lprrbXWWmuttdZaa6211lprrbXWWmuttdZaa6211lprrbXWWmuttdZaa6211lprrbXWWmuttdZaa6211lprrbXWWmuttdZaa6211loAkG+FA4D/g40zrCSdFY4GFxqyEgAIBwAAjGHMQeeggw5Cw5RzEEIIIYQQGqYglBJCKaWklEEnJaVSUkoppcxBKSmVklJKqXVSUmotpdZai62TklJLKaXWWosdhFRSaq212GLrIKSUUmuttRhjKCW11lqLMcYYQykptdZajDHWWEppqbUYY4wxxlJSSq3FGGOMMZaUWoutxRhjjLWk1FpsMcYaY40FAHA3OABAJNg4w0rSWeFocKEhKwGAkAAABCHGnHPOOegchBApxZhzzjkHIYQQIqUYc8455yCEEELGmHPOQQghhBBCyBhzzjkIIYQQQgidc85BCCGEEEIIoXPOOQghhBBCCCF0zkEIIYQQQgghhM45CCGEEEIIIYTQQQghhBBCCCGEEjoIIYQQQgghhBBCCCGEEEIIIYRQSgghhBBCCCGEEEIoIYQQQgghhBJCKCGEEEIIIZQQQgmhhBBCCCGEUkoooZQQQgghhFBKKCWEUgAAwIEDAECAEXSSUWURNppw4QEoNGQlAEAGAIBAjTX2FmtklHKQSsslQko5KbGXSinlILQaM6WMUoxqyRhTSjGJuYQOKaSkltA5pZBRlFJLJYQIQWk5xhg7xgAAABAEABiIkJlAoAAKDGQAwAFCghQAUFhg6BguAgJyCRkFBoVjwjnptAEACEJkhkhELAaJCdVAUTEdACwuMOQDQIbGRtrFBXQZ4IIu7joQQhCCEMTiAApIwMEJNzzxhifc4ASdolIHAQAAAACAAAAPAADJBhAREc0cR4fHB0iIyAhJickJSgAAAAAAAAHABwBAkgJEREQzx9Hh8QESIjJCUmJyghIAAAAAAAAAAAAEBAQAAAAAAAIAAAAEBE9nZ1MABESsAAAAAAAAJQIAAAIAAAC/DG2DLQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQAKDg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg=='
export default Sound