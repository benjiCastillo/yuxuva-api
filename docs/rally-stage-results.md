# Rally Stage Results

## Objetivo

Este documento define la convención de uso para los campos `startTime`, `endTime`, `time`, `penalty` y `status` del modelo `RallyStageResult`.

`RallyStageResult` ahora representa el resultado efectivo de una participacion previamente programada en `RallyStageSchedule`.

La relacion funcional esperada es:

- `RallyStageSchedule`: define que equipo participa, con su orden de partida y hora programada
- `RallyStageResult`: registra los tiempos reales de esa programacion

## Convención de tiempo

Los campos `startTime` y `endTime` representan los datos operativos capturados en carrera.

El campo `time` no se envía manualmente desde cliente: se calcula en backend como la diferencia entre `endTime` y `startTime`.

Los campos `time` y `penalty` se almacenan en milisegundos (`ms`).

Razones:

- En rally las diferencias entre competidores pueden ser muy pequeñas.
- Guardar solo segundos pierde precisión real de clasificación.
- `Int` en milisegundos permite ordenar, sumar penalizaciones y calcular posiciones sin errores de precisión.
- Es preferible a usar `Float` o strings como `mm:ss.SSS`.

## Campos

### `startTime`

Hora de partida registrada para el equipo en la etapa.

- Tipo recomendado de uso en API: ISO 8601
- Se almacena como `DateTime`
- Obligatorio en `POST`
- Corresponde a la hora real registrada para la programacion seleccionada

Ejemplo:

- `2026-03-21T10:00:00.000Z`

### `endTime`

Hora de llegada registrada para el equipo en la etapa.

- Tipo recomendado de uso en API: ISO 8601
- Se almacena como `DateTime`
- Obligatorio en `POST`
- Corresponde a la hora real de llegada registrada para la programacion seleccionada

Ejemplo:

- `2026-03-21T10:14:05.237Z`

### `time`

Tiempo base calculado automáticamente en backend usando:

```text
time = endTime - startTime
```

- Tipo actual: `Int`
- Unidad definida: milisegundos (`ms`)
- No debe enviarse manualmente en la API

Ejemplos:

- `845237` = 14 minutos, 5 segundos, 237 milisegundos
- `37215` = 37 segundos, 215 milisegundos

### `penalty`

Tiempo adicional aplicado al resultado del equipo por sanción deportiva o técnica.

- Tipo actual: `Int`
- Unidad definida: milisegundos (`ms`)
- Opcional en la API
- Si no se envía, puede asumirse `0`

Ejemplos:

- `10000` = penalización de 10 segundos
- `2500` = penalización de 2.5 segundos

### `status`

Estado deportivo del resultado.

- Tipo actual: `String`
- Valor por defecto en schema: `OK`

Valores recomendados:

- `OK`: completó la etapa normalmente
- `DNF`: did not finish
- `DNS`: did not start
- `DSQ`: disqualified

Nota:

Actualmente el schema no restringe estos valores con un enum o constante cerrada. Aun así, backend y frontend deberían usar únicamente este conjunto recomendado para mantener consistencia.

## Interpretación del resultado

El tiempo base de una etapa debe calcularse como:

```text
time = endTime - startTime
```

El tiempo final computado debe calcularse como:

```text
finalTime = time + penalty
```

Ejemplo:

```text
startTime = 2026-03-21T10:00:00.000Z
endTime   = 2026-03-21T10:14:05.237Z
time      = 845237
penalty = 10000
final   = 855237
```

Representación humana:

```text
845237 ms  = 14:05.237
10000 ms   = 00:10.000
855237 ms  = 14:15.237
```

## Ejemplo de payload

```json
{
  "scheduleId": "2a91d31d-3b97-48b6-b6d6-0c8bb0f6d9a4",
  "startTime": "2026-03-21T10:00:00.000Z",
  "endTime": "2026-03-21T10:14:05.237Z",
  "penalty": 10000,
  "status": "OK"
}
```

## Reglas recomendadas para frontend

- Mostrar `startTime` y `endTime` como horas legibles.
- Mostrar `time` y `penalty` convertidos desde milisegundos.
- No mostrar directamente el entero crudo al usuario final.
- Formatear tiempos con precisión de milisegundos.
- Usar `time + penalty` para clasificaciones cuando `status = OK`.
- Si `status` es `DNF`, `DNS` o `DSQ`, tratar el resultado según la lógica deportiva definida por el negocio.

## Regla de mantenimiento

Mientras los campos sigan llamándose `time` y `penalty`, toda nueva implementación debe asumir que:

- `startTime` y `endTime` son la fuente primaria del cálculo
- `time` = milisegundos
- `penalty` = milisegundos
