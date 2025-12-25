export type TEMPLATES = 'new' | 'accepted' | 'rejected';

export interface MailOptions {
  to: string;
  subject: string;
  template: TEMPLATES; // The name of the template file (without extension)
  context: any; // Variables for the Handlebars template
}
