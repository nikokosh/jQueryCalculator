import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DisplayComponent {

  @Input() value: string = '0'
  @Input() expression: string = ''

}
