
import { Adapter } from '~lib/adapters';
import * as grafana from '../adapters/grafana_browser';
import * as local from '../adapters/mocked_data';

export const supportedPlugins: Adapter[] = [
  grafana.adapter,
  local.adapter,
];
