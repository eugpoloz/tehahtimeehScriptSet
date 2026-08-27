import restoreReservedPost from "../helpers/restore-reserved-post";

const editorConfig = {
  fonts: [
    "Inter",
    "Oswald",
    "Amatic SC",
    "Bad Script",
    "Caveat",
    "Comfortaa",
    "Comforter Brush",
    "Cormorant Garamond",
    "Great Vibes",
    "Grenze Gotisch",
    "Jost",
    "Lora",
    "Oranienbaum",
    "Pangolin",
    "Playfair Display",
    "Playfair Display SC",
    "Prata",
    "Stick",
    "Viaoda Libre",
    "Unbounded",
    "Roboto",
    "Roboto Condensed",
    "Roboto Slab"
  ],
  tags: {
    subject: {
      name: "Название темы",
      onclick() {
        insert("[subject]");
      }
    },
    hideprofile: {
      name: "Скрыть минипрофиль",
      onclick() {
        insert("[hideprofile]");
      }
    },
    restore: {
      name: "Восстановить последний пост",
      onclick: restoreReservedPost
    }
  }
};

export default editorConfig;
