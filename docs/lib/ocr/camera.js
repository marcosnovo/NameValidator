// ──────────────────────────────────────────────────────────────────────────
//  Camera — captura de foto de documento desde la webcam del navegador
// ──────────────────────────────────────────────────────────────────────────
//
// Funciona 100% en el navegador, sin enviar nada a servidores externos.
// Permisos: requiere consentimiento explícito del usuario (HTTPS o localhost).
//
// API:
//   const cam = new DocumentCamera(videoElement);
//   await cam.start({ facingMode: 'environment' });   // cámara trasera
//   const blob = await cam.capture();                 // returns image Blob
//   cam.stop();

export class DocumentCamera {
  /**
   * @param {HTMLVideoElement} videoEl — elemento <video> donde mostrar el preview
   */
  constructor(videoEl) {
    if (!videoEl) throw new Error('DocumentCamera: videoElement requerido');
    this.video = videoEl;
    /** @type {MediaStream | null} */
    this.stream = null;
  }

  /**
   * Solicita permiso y arranca el preview. En móviles preferimos la cámara
   * trasera ('environment'); en desktop la frontal sirve.
   *
   * @param {Object} [options]
   * @param {'environment' | 'user'} [options.facingMode='environment']
   * @param {number} [options.idealWidth=1920]
   * @param {number} [options.idealHeight=1080]
   */
  async start({
    facingMode = 'environment',
    idealWidth = 1920,
    idealHeight = 1080,
  } = {}) {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Tu navegador no soporta acceso a cámara (requiere HTTPS).');
    }
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: idealWidth },
          height: { ideal: idealHeight },
        },
        audio: false,
      });
    } catch (err) {
      throw new Error(
        err.name === 'NotAllowedError'
          ? 'Permiso denegado. Habilita el acceso a la cámara en los ajustes del navegador.'
          : err.name === 'NotFoundError'
            ? 'No se ha encontrado ninguna cámara en este dispositivo.'
            : `Error al acceder a la cámara: ${err.message}`,
      );
    }
    this.video.srcObject = this.stream;
    this.video.setAttribute('playsinline', 'true');
    await this.video.play();
  }

  /**
   * Captura el frame actual del preview a un Blob (image/jpeg, 0.92).
   * @returns {Promise<Blob>}
   */
  async capture() {
    if (!this.stream) throw new Error('Llama a start() antes de capture()');
    const w = this.video.videoWidth;
    const h = this.video.videoHeight;
    if (!w || !h) throw new Error('La cámara aún no ha cargado un frame');
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(this.video, 0, 0, w, h);
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Captura fallida'))),
        'image/jpeg',
        0.92,
      );
    });
  }

  /**
   * Captura y devuelve un dataURL (más cómodo para mostrar el preview en
   * un <img>).
   * @returns {Promise<{ blob: Blob, dataUrl: string, width: number, height: number }>}
   */
  async captureWithPreview() {
    const blob = await this.capture();
    const dataUrl = await blobToDataURL(blob);
    return {
      blob,
      dataUrl,
      width: this.video.videoWidth,
      height: this.video.videoHeight,
    };
  }

  /**
   * Detiene el stream de la cámara y libera recursos.
   */
  stop() {
    if (this.stream) {
      for (const track of this.stream.getTracks()) track.stop();
      this.stream = null;
    }
    if (this.video) this.video.srcObject = null;
  }

  /**
   * Lista las cámaras disponibles (útil para móviles con cámara doble).
   * @returns {Promise<MediaDeviceInfo[]>}
   */
  static async listCameras() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((d) => d.kind === 'videoinput');
  }
}

function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
