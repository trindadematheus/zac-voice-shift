function calculatePitch(maxHealth, currentHealth) {
  return 12 * (1 - currentHealth / maxHealth);
}

document.addEventListener("DOMContentLoaded", async () => {
  const inputDevices = document.getElementById("inputDevices");
  const outputDevices = document.getElementById("outputDevices");

  const startButton = document.getElementById("startButton");

  let microphone;
  let pitchShift;
  let isActive = false;

  const devices = await navigator.mediaDevices.enumerateDevices();

  devices.forEach((device) => {
    if (device.kind === "audioinput") {
      const option = document.createElement("option");
      option.value = device.deviceId;
      option.text = device.label || `Microphone ${inputDevices.length + 1}`;
      inputDevices.appendChild(option);
    } else if (device.kind === "audiooutput") {
      const option = document.createElement("option");
      option.value = device.deviceId;
      option.text = device.label || `Speaker ${outputDevices.length + 1}`;
      outputDevices.appendChild(option);
    }
  });

  startButton.addEventListener("click", async () => {
    isActive = !isActive;
    startButton.innerText = isActive ? "STOP" : "START";

    if (isActive) {
      setupPitch();
    }

    if (!isActive) {
      if (microphone) {
        microphone.dispose();
      }

      if (pitchShift) {
        pitchShift.dispose();
      }

      Tone.Transport.stop();
    }
  });

  async function setupPitch(pitchValue) {
    const selectedInputDeviceId = inputDevices.value;
    const selectedOutputDeviceId = outputDevices.value;

    if (microphone) {
      microphone.dispose();
    }

    const audioElement = document.getElementById("output");
    await audioElement.setSinkId(selectedOutputDeviceId);

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: selectedInputDeviceId },
    });

    microphone = await new Tone.UserMedia().open(stream);
    pitchShift = new Tone.PitchShift(pitchValue || 0);

    microphone.connect(pitchShift);

    const dest = Tone.getContext().createMediaStreamDestination();
    pitchShift.connect(dest);

    audioElement.srcObject = dest.stream;
  }

  async function handleSetPitch() {
    if (pitchShift) {
      const playerData = await window.electronAPI.getPlayerData();
      const { maxHealth, currentHealth } = JSON.parse(playerData).championStats;
      pitchShift.pitch = calculatePitch(maxHealth, currentHealth);
    }
  }

  setInterval(() => {
    handleSetPitch();
  }, [500]);
});
