// This file was generated by SquareLine Studio
// SquareLine Studio version: SquareLine Studio 1.5.0
// LVGL version: 8.3.11
// Project name: SquareLine_Project

#ifndef UI_EVENTS_H
#define UI_EVENTS_H

#include "lvgl.h"

#ifdef __cplusplus
extern "C" {
#endif

void event_handler_keyboard(lv_event_t * e);
void event_handler_password(lv_event_t * e);
void check_password_event(lv_event_t * e);
void toggle_password_visibility(lv_event_t * e);
void start_idle_timer(void);
void reset_idle_timer(void);

#ifdef __cplusplus
} /* extern "C" */
#endif

#endif /* UI_EVENTS_H */

