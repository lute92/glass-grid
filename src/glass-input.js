class GlassButton extends HTMlElement {
    constructor() {
        super();
    }
}
customElements.define("gl-button", GlassButton, { extends: 'button' });