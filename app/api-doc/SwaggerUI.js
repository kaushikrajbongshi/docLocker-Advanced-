"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function Swagger({ spec }) {
  return <SwaggerUI spec={spec} />;
}