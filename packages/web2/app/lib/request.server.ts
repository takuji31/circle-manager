declare global {
  interface Request {
    query: Record<string, string | File>;
  }
}

// Request.prototype.query =

export default {};
