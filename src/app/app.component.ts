import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  form: FormGroup;
  
  constructor(formBuilder: FormBuilder) {
    this.form = formBuilder.group({
      web_url: null,
      printer_path: null
    });
  }

  save() {}
}
