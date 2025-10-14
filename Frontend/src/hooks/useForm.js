import { useState } from "react";

export const useForm = (initialValues, onSubmitCallback) => {
  const [formValues, setFormValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  // Maneja cambios de inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  // Maneja envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // reset de errores
    try {
      await onSubmitCallback(formValues);
    } catch (err) {
      setErrors(err); // puedes personalizar según tu lógica
    }
  };

  return {
    formValues,
    setFormValues,
    errors,
    handleChange,
    handleSubmit,
  };
};
