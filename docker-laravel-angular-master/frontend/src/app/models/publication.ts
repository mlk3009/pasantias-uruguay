export interface Publication {
  id: number;
  title: string;
  description: string;
  salary: string;
  location: string;
  type: string;
  time: string;
  deathline: string;
  postulation_way: string;
  user_id: number;
  requeriments: Requeriments[];
}
export interface Requeriments {
  title: string;
  level: string;
}

export class Publication {
  publication: Publication[];
  requeriments: Requeriments[];
  constructor() {
    this.publication = [];
    this.requeriments = [];
  }
}
