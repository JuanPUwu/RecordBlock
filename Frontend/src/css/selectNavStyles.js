const selectNavStyles = {
  container: (base) => ({
    ...base,
    height: "100%",
    width: "13%",
    minWidth: "4rem",
    borderRadius: "0.5rem",
    boxShadow: "0 3px 6px rgba(0, 0, 0, 0.1)",
  }),
  control: (base, state) => ({
    ...base,
    height: "100%",
    borderRadius: "0.5rem",
    border: "none",
    flexWrap: "nowrap",
    cursor: "pointer",
    boxShadow: "none",
    outline: state.isFocused ? "auto" : "none",
  }),
  valueContainer: (base) => ({
    ...base,
    height: "100%",
    padding: "0 0.8rem",
  }),
  placeholder: (base) => ({
    ...base,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    display: "inline-block",
    maxWidth: "100%",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  menu: (base) => ({
    ...base,
    borderRadius: "0.5rem",
    overflow: "hidden",
    marginTop: "0.6rem",
  }),
  menuList: (base) => ({
    ...base,
    padding: 0,
  }),
  option: (base, state) => {
    let backgroundColor = "white";
    if (state.isSelected) {
      backgroundColor = "#ebebeb";
    } else if (state.isFocused) {
      backgroundColor = "#f5f5f5";
    }

    return {
      ...base,
      cursor: "pointer",
      backgroundColor,
      color: "#000",
      ":active": {
        backgroundColor: "#d6d6d6", // <- color cuando mantienes presionado el click
      },
    };
  },
};

export default selectNavStyles;
